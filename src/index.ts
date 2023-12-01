import TelegramClient from 'node-telegram-bot-api';
import { createCompletionsProvider } from './providers/completions.provider.ts';
import OpenAI, { toFile } from 'openai';
require('dotenv').config({ path: '.env' });

import { TELEGRAM_TOKEN, OPENAI_SECRET_KEY, DEFAULT_GPT_MODEL } from './constants.ts';
import { handleMessage } from './messageProcessor.ts';

const startTheBot = async () => {
	const telegramClient = new TelegramClient(TELEGRAM_TOKEN, { polling: true });
	const generateGptCompletion = createCompletionsProvider(OpenAI, OPENAI_SECRET_KEY, { temperature: 0.85, max_tokens: 256, model: DEFAULT_GPT_MODEL });

	telegramClient.on('polling_error', (error: any) => console.error(`Polling error: ${error}`));
	telegramClient.on('message', (msg: any) => handleMessage(msg, generateGptCompletion, telegramClient));
};

startTheBot();
