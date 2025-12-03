import axios from 'axios';
import puppeteer from 'puppeteer';
import OpenAI from 'openai';
import TelegramBot from 'node-telegram-bot-api';
import { config } from './config';
import { StaticScraper } from './services/scraper/strategies/StaticScraper';
import { DynamicScraper } from './services/scraper/strategies/DynamicScraper';
import { ScraperService } from './services/scraper/ScraperService';
import { OpenAiProvider } from './services/ai/OpenAiProvider';
import { SummarizerBot } from './bot/SummarizerBot';

export class ServiceContainer {
  static create() {
    const axiosInstance = axios.create({
      timeout: config.scraping.timeout,
      headers: {
        'User-Agent': config.scraping.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });

    const puppeteerLauncher = {
        launch: () => puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
    };

    const openAiClient = new OpenAI({ apiKey: config.openai.apiKey });

    const telegramBot = new TelegramBot(config.telegram.token, config.telegram.options);

    const staticScraper = new StaticScraper(axiosInstance);
    const dynamicScraper = new DynamicScraper(puppeteerLauncher as any);
    const aiProvider = new OpenAiProvider(openAiClient);

    const scraperService = new ScraperService(staticScraper, dynamicScraper);

    const bot = new SummarizerBot(telegramBot, scraperService, aiProvider);

    return { bot };
  }
}
