// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RailMatteAgreementRegistry
 * @dev Privacy-preserving trust anchor for voluntary train seat exchange agreements on Monad.
 *
 * PRIVACY SPECIFICATION:
 * - NO personal passenger details (names, contact info, PNRs, seat numbers, journey documents)
 *   are ever stored on-chain.
 * - Only a salted cryptographic commitment hash (`commitmentHash`) and an opaque exchange
 *   identifier (`exchangeId`) are recorded.
 * - Off-chain computation: `commitmentHash = keccak256(abi.encode(DOMAIN_SEPARATOR, exchangeId, saltNonce, termsHash))`
 * - This provides tamper-evident auditability without leaking journey or passenger privacy.
 *
 * TRUST BOUNDARIES:
 * - Proves: Mutual agreement terms were anchored on Monad at a specific block timestamp.
 * - Does NOT prove: Official railway reservation modification, physical seat possession,
 *   or live passenger identity.
 */
contract RailMatteAgreementRegistry {
    // Domain identifier to prevent cross-protocol collision
    bytes32 public constant PROTOCOL_DOMAIN = keccak256("RAILMATTE_EXCHANGE_AGREEMENT_V1");

    struct AgreementRecord {
        bytes32 exchangeId;
        address recorder;
        uint256 recordedAt;
        bool exists;
    }

    // Mapping from commitmentHash => AgreementRecord
    mapping(bytes32 => AgreementRecord) private _agreements;

    // Total count of verified commitments anchored
    uint256 public totalAgreements;

    // Emitted when a verified bilateral agreement commitment is recorded on-chain
    event AgreementCommitted(
        bytes32 indexed commitmentHash,
        bytes32 indexed exchangeId,
        address indexed recorder,
        uint256 timestamp
    );

    // Custom errors for gas efficiency and clear debugging
    error InvalidCommitmentHash();
    error InvalidExchangeId();
    error AgreementAlreadyExists(bytes32 commitmentHash);

    /**
     * @notice Records an off-chain agreed seat exchange commitment onto Monad
     * @param commitmentHash Keccak256 hash of the salted agreement terms
     * @param exchangeId Opaque identifier of the exchange session
     */
    function recordAgreement(bytes32 commitmentHash, bytes32 exchangeId) external returns (bool) {
        if (commitmentHash == bytes32(0)) revert InvalidCommitmentHash();
        if (exchangeId == bytes32(0)) revert InvalidExchangeId();
        if (_agreements[commitmentHash].exists) revert AgreementAlreadyExists(commitmentHash);

        _agreements[commitmentHash] = AgreementRecord({
            exchangeId: exchangeId,
            recorder: msg.sender,
            recordedAt: block.timestamp,
            exists: true
        });

        unchecked {
            totalAgreements++;
        }

        emit AgreementCommitted(commitmentHash, exchangeId, msg.sender, block.timestamp);
        return true;
    }

    /**
     * @notice Queries whether a commitment hash is officially registered
     * @param commitmentHash The commitment hash to check
     * @return True if recorded, false otherwise
     */
    function isAgreementCommitted(bytes32 commitmentHash) external view returns (bool) {
        return _agreements[commitmentHash].exists;
    }

    /**
     * @notice Retrieves record metadata for a given commitment hash
     * @param commitmentHash The commitment hash to query
     * @return exchangeId The associated exchange session identifier
     * @return recorder Address that recorded the transaction
     * @return recordedAt Block timestamp when recorded
     * @return exists Boolean flag indicating existence
     */
    function getAgreement(bytes32 commitmentHash)
        external
        view
        returns (
            bytes32 exchangeId,
            address recorder,
            uint256 recordedAt,
            bool exists
        )
    {
        AgreementRecord memory rec = _agreements[commitmentHash];
        return (rec.exchangeId, rec.recorder, rec.recordedAt, rec.exists);
    }
}
