import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

/**
 * Robust environment variable loader for RailMatte.
 * Resolves root .env regardless of whether process was launched
 * from monorepo root, backend subdirectory, or via npm --prefix.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ordered candidate search paths:
// 1. Monorepo root (.env) -> 3 levels up from backend/src/config
// 2. Backend package root (.env) -> 2 levels up from backend/src/config
// 3. Current process working directory
export function getEnvCandidatePaths() {
  return [
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env')
  ];
}

export function findEnvFile() {
  const candidates = getEnvCandidatePaths();
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function loadEnv() {
  const envFilePath = findEnvFile();
  if (envFilePath) {
    const result = dotenv.config({ path: envFilePath });
    return {
      loaded: true,
      path: envFilePath,
      error: result.error || null
    };
  }

  // Fallback to standard dotenv resolution
  const fallback = dotenv.config();
  return {
    loaded: false,
    path: null,
    error: fallback.error || null
  };
}

// Execute immediately on module import so all subsequent modules have access
export const envStatus = loadEnv();

/**
 * Returns safe environment summary without leaking secrets.
 */
export function getSafeEnvSummary() {
  let supabaseHost = null;
  if (process.env.SUPABASE_URL) {
    try {
      supabaseHost = new URL(process.env.SUPABASE_URL).hostname;
    } catch {
      supabaseHost = 'configured (invalid url format)';
    }
  }

  return {
    isConfiguredInEnv: envStatus.loaded,
    envPath: envStatus.path,
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasSupabaseKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseHost,
    hasSupabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}
