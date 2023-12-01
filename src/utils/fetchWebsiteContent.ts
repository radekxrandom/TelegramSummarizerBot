import puppeteer from 'puppeteer';
import axios from 'axios';


export const fetchDataFromDynamicWebsite = async (url: string): Promise<string> => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	try {
		// Navigate to the URL
		await page.goto(url, { waitUntil: 'domcontentloaded' });

		// Get the content after JavaScript rendering
		const content = await page.content();
		console.log(content);
		return content;
	} catch (error: any) {
		console.error(error.message);
		return "";
	} finally {
		await browser.close();
	}
};

export const fetchWebsiteContent = async (url: string) => {
	console.log('url: ', url);
	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
	};
	let response;
	try {
		response = (await axios.get(url, { headers })).data;
	} catch (e) {
		response = await fetchDataFromDynamicWebsite(url);
		return response;
	}
	return response;
};