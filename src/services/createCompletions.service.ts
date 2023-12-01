import { CouldNotGenerateCompletionError } from '../errors/CouldNotGenerateCompletion.error';

export const createCompletion = (openai: any, options: { temperature?: number, max_tokens?: number, model?: string; } = {}) => {
	const temperature = options.temperature ?? 0.95;
	const max_tokens = options.max_tokens ?? 4096;
	const model = options.model ?? 'ft:gpt-3.5-turbo-0613:personal::8QHBZEUd';

	const generateResponse = async (websiteText: string, userInstructions: string = 'summarize this website:'): Promise<string> => {
		console.log('userInstructions: ', userInstructions);
		try {
			const completion = await openai.chat.completions.create({
				messages: [{ "role": "system", "content": "You summarize articles, reddit threads, forum threads, websites. Summarize the website's content. Focus on meritorics. Use simple language and short sentences. Respect user instructions" },
				{ role: "user", "content": `${userInstructions}: "${websiteText}"` }],
				model: model,
				temperature: temperature,
				max_tokens: max_tokens,
			});
			console.log(completion.choices[0].message.content);
			return completion.choices[0].message.content;
		} catch (error) {
			console.error("Error:", error);
			throw new CouldNotGenerateCompletionError("Failed to summarize the website content");
		}
	};

	return generateResponse;

};