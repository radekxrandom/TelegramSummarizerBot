import { CouldNotFetchWebsiteError } from './errors/CouldNotFetchWebsite.error';
import { CouldNotGenerateCompletionError } from './errors/CouldNotGenerateCompletion.error';
import { fetchWebsiteContent } from './utils/fetchWebsiteContent';
import { matchUrls, retrieveTextMessage, preprocessText, extractTextFromHtml, removeScripts } from './utils/textProcessingUtils';


const processMessage = (msg: any) => {
	const msgProcessed = {
		userId: msg.chat.id,
		text: msg.text
	};
	const match = matchUrls(msgProcessed.text);
	const instructions = match ? retrieveTextMessage(msgProcessed.text) : null;
	return { msgProcessed, match, instructions };
};

const generateSummary = async (match: any, instructions: any, generateGptCompletion: any) => {
	let content, summary;
	try {
		content = await fetchWebsiteContent(match);
		console.debug('processed website text length: ', preprocessText(extractTextFromHtml(removeScripts(content))).length);
	} catch (e) {
		throw new CouldNotFetchWebsiteError('Failed to fetch website content');
	}
	try {
		summary = await generateGptCompletion(preprocessText(extractTextFromHtml(removeScripts(content))), instructions);
	} catch (e) {
		throw new CouldNotGenerateCompletionError('Failed to summarize the website content');
	}
	return summary;
};

const respond = (telegramClient: any, processedMessage: any, content: string) => {
	telegramClient.sendMessage(processedMessage.userId, content);
};

export const handleMessage = async (msg: any, generateGptCompletion: any, telegramClient: any) => {
	console.debug(msg);
	if (msg.from.first_name === 'tldr' || msg.message_id < 60) {
		return true;
	}
	const { msgProcessed, match, instructions } = processMessage(msg);
	if (match) {
		console.debug('instructions: ', instructions);
		let summary;
		try {
			summary = await generateSummary(match, instructions, generateGptCompletion);
		} catch (e: any) {
			respond(telegramClient, msgProcessed, e.message);
			return;
		}

		respond(telegramClient, msgProcessed, summary);
	}
};