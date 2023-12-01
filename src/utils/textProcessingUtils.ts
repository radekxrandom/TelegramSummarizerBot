import cheerio from 'cheerio';


export const matchUrls = (text: string) => {
	const regex = /\/summarize\s(https?:\/\/\S+)/;
	const match = text.match(regex);

	if (match) {
		return match[1];
	} else {
		return false;
	}
};

export const retrieveTextMessage = (text: string) => {
	const urlPattern = /(https?:\/\/[^\s]+)/g;
	const messageWithoutUrls = text.replace(urlPattern, '');
	return messageWithoutUrls;
};


export const removeScripts = (html: string): string => {
	// Remove inline script tags
	const withoutInlineScripts = html.replace(/<script\b[^>]*>(.*?)<\/script>/gs, '');

	// Remove external script tags
	const $ = cheerio.load(withoutInlineScripts);
	$('script').remove();

	return $.html();
};
export const extractTextFromHtml = (html: string): string => {
	const $ = cheerio.load(html);
	const textContent = $('body').text();
	return textContent;
};

export const preprocessText = (text: string): string => {
	// Your preprocessing logic here
	return text
		.replace(/\s+/g, ' ')  // Remove extra white space
		.replace(/\n/g, '')    // Remove new line characters
		.replace(/[^a-zA-Z0-9 ]/g, "")
		.replace(/<[^>]*>/g, '') // remove html tags
		.trim().toLowerCase();
};