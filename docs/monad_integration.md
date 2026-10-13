# Monad Integration Guide & Network Parameters

## 1. Monad Testnet Official Configuration

| Parameter | Value |
|---|---|
| **Network Name** | Monad Testnet |
| **Chain ID (Decimal)** | `10143` |
| **Chain ID (Hex)** | `0x279f` |
| **Currency Symbol** | `MON` (18 Decimals) |
| **Public RPC Endpoint** | `https://testnet-rpc.monad.xyz` |
| **Block Explorer** | `https://testnet.monadexplorer.com` |

## 2. Smart Contract Overview

Contract: [`contracts/contracts/RailMatteAgreementRegistry.sol`](file:///d:/Unstop/Metropolis/RailMatte/contracts/contracts/RailMatteAgreementRegistry.sol)

### Core Interface:
```solidity
function recordAgreement(bytes32 commitmentHash, bytes32 exchangeId) external returns (bool);
function isAgreementCommitted(bytes32 commitmentHash) external view returns (bool);
function getAgreement(bytes32 commitmentHash) external view returns (bytes32 exchangeId, address recorder, uint256 recordedAt, bool exists);
function totalAgreements() external view returns (uint256);
```

### Event:
```solidity
event AgreementCommitted(
    bytes32 indexed commitmentHash,
    bytes32 indexed exchangeId,
    address indexed recorder,
    uint256 timestamp
);
```

## 3. Running Automated Contract Tests
From root or `contracts/`:
```bash
npm run test:contracts
# or: cd contracts && npx hardhat test
```
Result: 6 passing automated tests covering registration, duplicate prevention, zero-byte rejection, and state retrieval.

## 4. Deploying to Monad Testnet

1. Obtain Monad Testnet `$MON` tokens from the official Monad faucet.
2. In the root `.env` or `contracts/.env`, set your deployer private key:
   ```bash
   DEPLOYER_PRIVATE_KEY=0xYourPrivateKeyWithoutQuotes
   MONAD_RPC_URL=https://testnet-rpc.monad.xyz
   ```
3. Run the deployment script:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.cjs --network monadTestnet
   ```
4. Copy the deployed contract address and update:
   - `backend/.env`: `MONAD_CONTRACT_ADDRESS=0xYourDeployedAddress`
   - `frontend/.env`: `VITE_CONTRACT_ADDRESS=0xYourDeployedAddress`
