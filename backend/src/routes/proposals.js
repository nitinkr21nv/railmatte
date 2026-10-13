import express from 'express';
import { store } from '../services/store.js';
import { requireAuth } from '../middleware/auth.js';
import { evaluateCompatibility } from '../services/matching.js';
import { createAgreementCommitment } from '../services/crypto.js';

const router = express.Router();

// List user proposals (incoming or outgoing)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const proposals = await store.getProposals({ userId: req.user.id, status });

    // Enrich with requests & user display names
    const enriched = await Promise.all(
      proposals.map(async (prop) => {
        const [reqA, reqB, proposer, recipient, commitment] = await Promise.all([
          store.getRequestById(prop.request_a_id),
          store.getRequestById(prop.request_b_id),
          store.getUser(prop.proposer_id),
          store.getUser(prop.recipient_id),
          store.getCommitmentByProposalId(prop.id)
        ]);

        return {
          ...prop,
          requestA: reqA,
          requestB: reqB,
          proposer: proposer ? { id: proposer.id, display_name: proposer.display_name } : null,
          recipient: recipient ? { id: recipient.id, display_name: recipient.display_name } : null,
          commitment
        };
      })
    );

    res.json({ proposals: enriched });
  } catch (err) {
    next(err);
  }
});

// Create new exchange proposal
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { request_a_id, request_b_id } = req.body;

    if (!request_a_id || !request_b_id) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Both request_a_id and request_b_id are required'
      });
    }

    if (request_a_id === request_b_id) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Cannot create a proposal between the same request'
      });
    }

    const [reqA, reqB] = await Promise.all([
      store.getRequestById(request_a_id),
      store.getRequestById(request_b_id)
    ]);

    if (!reqA || !reqB) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'One or both exchange requests were not found'
      });
    }

    // Ownership check: Caller must own request A
    if (reqA.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only propose an exchange using your own request'
      });
    }

    // Prevent proposing to own other request
    if (reqB.user_id === req.user.id) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Cannot propose an exchange between two of your own requests'
      });
    }

    // Check request statuses
    if (reqA.status !== 'OPEN' || reqB.status !== 'OPEN') {
      return res.status(400).json({
        error: 'Conflict',
        message: 'Both requests must be OPEN to propose an exchange'
      });
    }

    // Compatibility validation
    const compatibility = evaluateCompatibility(reqA, reqB);
    if (!compatibility.isCompatible) {
      return res.status(400).json({
        error: 'IncompatibleRequests',
        message: `Requests are not compatible for exchange: ${compatibility.reasons.join(', ')}`
      });
    }

    // Check existing pending proposals
    const existingProposals = await store.getProposals({ status: 'PROPOSED' });
    const duplicate = existingProposals.find(
      (p) =>
        (p.request_a_id === request_a_id && p.request_b_id === request_b_id) ||
        (p.request_a_id === request_b_id && p.request_b_id === request_a_id)
    );

    if (duplicate) {
      return res.status(409).json({
        error: 'DuplicateProposal',
        message: 'An active proposal already exists between these two requests'
      });
    }

    // Create proposal (Proposer consent is explicitly recorded at creation time)
    const proposal = await store.createProposal({
      request_a_id,
      request_b_id,
      proposer_id: req.user.id,
      recipient_id: reqB.user_id
    });

    res.status(201).json({ proposal });
  } catch (err) {
    next(err);
  }
});

// Get proposal details
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const proposal = await store.getProposalById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'NotFound', message: 'Proposal not found' });
    }

    // Enforce participant permission
    if (proposal.proposer_id !== req.user.id && proposal.recipient_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You are not a participant in this exchange proposal' });
    }

    const [reqA, reqB, proposer, recipient, commitment] = await Promise.all([
      store.getRequestById(proposal.request_a_id),
      store.getRequestById(proposal.request_b_id),
      store.getUser(proposal.proposer_id),
      store.getUser(proposal.recipient_id),
      store.getCommitmentByProposalId(proposal.id)
    ]);

    res.json({
      proposal: {
        ...proposal,
        requestA: reqA,
        requestB: reqB,
        proposer: proposer ? { id: proposer.id, display_name: proposer.display_name, email: proposer.email } : null,
        recipient: recipient ? { id: recipient.id, display_name: recipient.display_name, email: recipient.email } : null,
        commitment
      }
    });
  } catch (err) {
    next(err);
  }
});

// Accept proposal (Recipient gives explicit consent -> Bilateral consent satisfied!)
router.post('/:id/accept', requireAuth, async (req, res, next) => {
  try {
    const proposal = await store.getProposalById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'NotFound', message: 'Proposal not found' });
    }

    // Permission check: Only recipient can accept
    if (proposal.recipient_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the recipient of the proposal can accept it. Proposer has already consented.'
      });
    }

    if (proposal.status !== 'PROPOSED') {
      return res.status(400).json({
        error: 'InvalidState',
        message: `Proposal cannot be accepted from state: ${proposal.status}`
      });
    }

    const [reqA, reqB] = await Promise.all([
      store.getRequestById(proposal.request_a_id),
      store.getRequestById(proposal.request_b_id)
    ]);

    const now = new Date().toISOString();

    // 1. Update proposal to ACCEPTED
    const updatedProposal = await store.updateProposal(proposal.id, {
      status: 'ACCEPTED',
      recipient_consent: true,
      recipient_consented_at: now
    });

    // 2. Mark underlying requests as MATCHED
    await Promise.all([
      store.updateRequest(proposal.request_a_id, { status: 'MATCHED' }),
      store.updateRequest(proposal.request_b_id, { status: 'MATCHED' })
    ]);

    // 3. Prepare privacy-preserving commitment hash for Monad anchoring
    const commitmentData = createAgreementCommitment({
      exchangeId: proposal.id,
      proposerId: proposal.proposer_id,
      recipientId: proposal.recipient_id,
      terms: {
        travel_date: reqA.travel_date,
        origin_station: reqA.origin_station,
        destination_station: reqA.destination_station,
        coach_class: reqA.coach_class,
        train_number: reqA.train_number
      }
    });

    const savedCommitment = await store.saveCommitment({
      proposal_id: proposal.id,
      commitment_hash: commitmentData.commitmentHash,
      salt_nonce: commitmentData.saltNonce,
      terms_digest: commitmentData.termsDigest,
      chain_id: Number(process.env.MONAD_CHAIN_ID || 10143),
      contract_address: process.env.MONAD_CONTRACT_ADDRESS || '0xefA55c69cbB76D9a625Cb820D6306bC9152a7e38',
      status: 'PREPARED'
    });

    res.json({
      proposal: updatedProposal,
      commitment: savedCommitment,
      message: 'Exchange mutually accepted by both passengers. Trust commitment prepared for Monad anchoring.'
    });
  } catch (err) {
    next(err);
  }
});

// Decline proposal
router.post('/:id/decline', requireAuth, async (req, res, next) => {
  try {
    const proposal = await store.getProposalById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'NotFound', message: 'Proposal not found' });
    }

    // Only recipient can decline
    if (proposal.recipient_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Only recipient can decline the proposal' });
    }

    if (proposal.status !== 'PROPOSED') {
      return res.status(400).json({ error: 'InvalidState', message: `Cannot decline proposal in status ${proposal.status}` });
    }

    const updated = await store.updateProposal(proposal.id, { status: 'DECLINED' });
    res.json({ proposal: updated, message: 'Proposal declined.' });
  } catch (err) {
    next(err);
  }
});

// Cancel proposal (Either participant before completion)
router.post('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const proposal = await store.getProposalById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'NotFound', message: 'Proposal not found' });
    }

    if (proposal.proposer_id !== req.user.id && proposal.recipient_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You are not a participant in this exchange' });
    }

    if (proposal.status === 'COMPLETED' || proposal.status === 'CANCELLED') {
      return res.status(400).json({ error: 'InvalidState', message: `Cannot cancel proposal in status ${proposal.status}` });
    }

    const updated = await store.updateProposal(proposal.id, { status: 'CANCELLED' });

    // Reopen requests if they were matched
    await Promise.all([
      store.updateRequest(proposal.request_a_id, { status: 'OPEN' }),
      store.updateRequest(proposal.request_b_id, { status: 'OPEN' })
    ]);

    res.json({ proposal: updated, message: 'Proposal cancelled and requests reopened.' });
  } catch (err) {
    next(err);
  }
});

// Complete exchange (Passengers successfully met and exchanged seats)
router.post('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const proposal = await store.getProposalById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'NotFound', message: 'Proposal not found' });
    }

    if (proposal.proposer_id !== req.user.id && proposal.recipient_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You are not a participant in this exchange' });
    }

    if (proposal.status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'InvalidState', message: 'Proposal must be in ACCEPTED status to mark completed' });
    }

    const updated = await store.updateProposal(proposal.id, { status: 'COMPLETED' });
    res.json({ proposal: updated, message: 'Exchange journey successfully marked complete!' });
  } catch (err) {
    next(err);
  }
});

export default router;
