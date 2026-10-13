import express from 'express';
import { isSupabaseLive } from '../services/store.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RailMatte API Server',
    version: '1.0.0',
    tagline: 'Swap seats. Travel better.',
    storageMode: isSupabaseLive ? 'supabase_postgresql' : 'in_memory_store',
    monadConfig: {
      chainId: Number(process.env.MONAD_CHAIN_ID || 10143),
      rpcUrl: process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz',
      contractAddress: process.env.MONAD_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
      explorerUrl: process.env.MONAD_EXPLORER_URL || 'https://testnet.monadexplorer.com'
    },
    aiAssistanceConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

export default router;
