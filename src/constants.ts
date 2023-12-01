import { readEnvValue } from "./utils/readEnvValue.service";

export const TELEGRAM_TOKEN = readEnvValue('TELEGRAM_TOKEN');
export const OPENAI_SECRET_KEY = readEnvValue("OPENAI_SECRET_KEY");
export const DEFAULT_GPT_MODEL = "gpt-3.5-turbo-1106";