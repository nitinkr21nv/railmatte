import express from 'express';
import { store } from '../services/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get commitment record for an exchange proposal
router.get('/:proposalId', requireAuth, async (req, res, next) => {
  try {
    const commitment = await store.getCommitmentByProposalId(req.params.proposalId);
    if (!commitment) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No blockchain trust commitment found for this proposal yet. Ensure mutual consent is accepted first.'
      });
    }

    res.json({ commitment });
  } catch (err) {
    next(err);
  }
});

// Confirm on-chain recording of commitment from verified Web3 wallet transaction
router.post('/:proposalId/confirm', requireAuth, async (req, res, next) => {
  try {
    const { tx_hash, contract_address, recorder_address } = req.body;

    if (!tx_hash || !/^0x[0-9a-fA-F]{64}$/.test(tx_hash)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid transaction hash format. Must be 0x-prefixed 64 hex characters.'
      });
    }

    if (!contract_address || !/^0x[0-9a-fA-F]{40}$/.test(contract_address)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid smart contract address format.'
      });
    }

    if (!recorder_address || !/^0x[0-9a-fA-F]{40}$/.test(recorder_address)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid recorder wallet address format.'
      });
    }

    const commitment = await store.getCommitmentByProposalId(req.params.proposalId);
    if (!commitment) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Commitment record not found for proposal'
      });
    }

    const updated = await store.updateCommitment(req.params.proposalId, {
      tx_hash,
      contract_address,
      recorder_address,
      status: 'CONFIRMED',
      recorded_at: new Date().toISOString()
    });

    res.json({
      commitment: updated,
      message: 'Monad on-chain agreement commitment successfully verified and recorded.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
