import { createCompletion } from '../services/createCompletions.service';


export const createCompletionsProvider = (OpenAi: any, apiKey: string, options: any) => {
	const openai = new OpenAi({ apiKey });
	return createCompletion(openai, options);
};