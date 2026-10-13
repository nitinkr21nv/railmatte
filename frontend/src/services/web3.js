import { BrowserProvider, Contract, id, ZeroHash } from 'ethers';

export const MONAD_TESTNET_CONFIG = {
  chainId: '0x279f', // 10143
  chainIdDecimal: 10143,
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: [import.meta.env.VITE_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: [import.meta.env.VITE_MONAD_EXPLORER_URL || 'https://testnet.monadexplorer.com'],
};

export const REGISTRY_ABI = [
  'function recordAgreement(bytes32 commitmentHash, bytes32 exchangeId) external returns (bool)',
  'function isAgreementCommitted(bytes32 commitmentHash) external view returns (bool)',
  'function getAgreement(bytes32 commitmentHash) external view returns (bytes32 exchangeId, address recorder, uint256 recordedAt, bool exists)',
  'function totalAgreements() external view returns (uint256)',
  'event AgreementCommitted(bytes32 indexed commitmentHash, bytes32 indexed exchangeId, address indexed recorder, uint256 timestamp)'
];

/**
 * Checks if EVM browser provider is available
 */
export function isWalletAvailable() {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

/**
 * Connects to EVM wallet, requests account access
 */
export async function connectWallet() {
  if (!isWalletAvailable()) {
    throw new Error('No Ethereum-compatible Web3 wallet found. Please install MetaMask, Rabby, or a compatible browser wallet.');
  }

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId),
  };
}

/**
 * Switches network to Monad Testnet or adds it if not present
 */
export async function ensureMonadNetwork() {
  if (!isWalletAvailable()) {
    throw new Error('Wallet not detected.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
    });
    return true;
  } catch (switchError) {
    // 4902 error indicates chain has not been added to wallet yet
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [MONAD_TESTNET_CONFIG],
      });
      return true;
    }
    throw switchError;
  }
}

/**
 * Records an agreement commitment on the Monad registry contract
 * @param {string} contractAddress
 * @param {string} commitmentHash 0x-prefixed 32-byte hex string
 * @param {string} exchangeId Unique exchange proposal ID
 */
export async function recordCommitmentOnMonad(contractAddress, commitmentHash, exchangeId) {
  if (!contractAddress || contractAddress === ZeroHash || contractAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Monad Agreement Registry contract address is not configured. Please supply a valid deployed contract address.');
  }

  await ensureMonadNetwork();

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const recorderAddress = await signer.getAddress();

  const registryContract = new Contract(contractAddress, REGISTRY_ABI, signer);

  // Convert string exchangeId into a bytes32 identifier if needed
  let exchangeIdBytes32;
  if (exchangeId.startsWith('0x') && exchangeId.length === 66) {
    exchangeIdBytes32 = exchangeId;
  } else {
    exchangeIdBytes32 = id(exchangeId);
  }

  // Submit transaction
  const tx = await registryContract.recordAgreement(commitmentHash, exchangeIdBytes32);

  // Wait for 1 confirmation on Monad
  const receipt = await tx.wait(1);

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    contractAddress,
    recorderAddress,
    status: receipt.status === 1 ? 'CONFIRMED' : 'FAILED',
    explorerUrl: `${MONAD_TESTNET_CONFIG.blockExplorerUrls[0]}/tx/${receipt.hash}`,
  };
}
