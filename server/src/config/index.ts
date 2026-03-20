import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  CMC_API_KEY: z.string().min(1, 'CoinMarketCap API key is required'),
  ANTHROPIC_API_KEY: z.string().min(1, 'Anthropic API key is required'),
  JWT_SECRET: z.string().min(16, 'JWT secret must be at least 16 characters'),
  PORT: z.string().default('3001'),
  DATABASE_PATH: z.string().default('./data/crypto-saas.db'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('https://block-view.app'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = {
  cmcApiKey: parsed.data.CMC_API_KEY,
  anthropicApiKey: parsed.data.ANTHROPIC_API_KEY,
  jwtSecret: parsed.data.JWT_SECRET,
  port: parseInt(parsed.data.PORT, 10),
  databasePath: parsed.data.DATABASE_PATH,
  nodeEnv: parsed.data.NODE_ENV,
  isDev: parsed.data.NODE_ENV === 'development',
  corsOrigin: parsed.data.CORS_ORIGIN,
} as const;
