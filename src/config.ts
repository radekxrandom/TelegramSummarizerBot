import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  TELEGRAM_TOKEN: z.string().min(1, "TELEGRAM_TOKEN is required"),
  OPENAI_SECRET_KEY: z.string().min(1, "OPENAI_SECRET_KEY is required"),
  DEFAULT_GPT_MODEL: z.string().default('gpt-3.5-turbo-1106'),
});

const resolveEnv = () => {
  if (process.env.NODE_ENV !== 'test') return process.env;
  return {
    ...process.env,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN ?? 'test-telegram-token',
    OPENAI_SECRET_KEY: process.env.OPENAI_SECRET_KEY ?? 'test-openai-key',
  };
};

const env = envSchema.parse(resolveEnv());

export const config = {
  telegram: {
    token: env.TELEGRAM_TOKEN,
    options: {
      polling: true,
    }
  },
  openai: {
    apiKey: env.OPENAI_SECRET_KEY,
    model: env.DEFAULT_GPT_MODEL,
    defaults: {
      temperature: 0.85,
      maxTokens: 2048,
    }
  },
  scraping: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    timeout: 10000,
  }
};
