import nock from 'nock';
import axios from 'axios';
import OpenAI from 'openai';
import TelegramBot from 'node-telegram-bot-api';
import { SummarizerBot } from './bot/SummarizerBot';
import { ScraperService } from './services/scraper/ScraperService';
import { StaticScraper } from './services/scraper/strategies/StaticScraper';
import { DynamicScraper } from './services/scraper/strategies/DynamicScraper';
import { OpenAiProvider } from './services/ai/OpenAiProvider';
import { MESSAGES } from './constants/messages';

jest.mock('node-telegram-bot-api');

describe('Integration Test: Full Flow', () => {
  let bot: SummarizerBot;
  let mockTelegramBot: jest.Mocked<TelegramBot>;

  beforeEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();

    const axiosInstance = axios.create();

    const mockPuppeteerLauncher = {
        launch: jest.fn()
    };

    const openAiClient = new OpenAI({ apiKey: 'test-key' });

    mockTelegramBot = new TelegramBot('token', { polling: true }) as jest.Mocked<TelegramBot>;

    const staticScraper = new StaticScraper(axiosInstance);
    const dynamicScraper = new DynamicScraper(mockPuppeteerLauncher);
    const aiProvider = new OpenAiProvider(openAiClient);

    const scraperService = new ScraperService(staticScraper, dynamicScraper);

    bot = new SummarizerBot(mockTelegramBot, scraperService, aiProvider);
  });

  afterAll(() => {
      nock.restore();
  });

  it('should scrape a website and reply with a summary', async () => {
      const chatId = 999;
      const url = 'https://test-site.com/article';
      // long enough content to pass the < 50 char check
      const htmlContent = '<html><body><h1>Article Title</h1><p>Important content that is definitely long enough to pass the length check which requires fifty characters or more to proceed with summarization.</p></body></html>';
      const summaryText = 'This is the summary.';

      nock('https://test-site.com')
        .get('/article')
        .reply(200, htmlContent);

      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(200, {
            choices: [
                {
                    message: {
                        content: summaryText
                    }
                }
            ]
        });

      const messageHandler = mockTelegramBot.on.mock.calls.find(call => call[0] === 'message')![1];

      await messageHandler({
          message_id: 1,
          date: 123456,
          chat: { id: chatId, type: 'private' },
          from: { is_bot: false, id: 1, first_name: 'User', is_premium: false },
          text: url
      } as TelegramBot.Message);

      expect(mockTelegramBot.sendMessage).toHaveBeenCalledWith(chatId, MESSAGES.START_READING);
      expect(mockTelegramBot.sendMessage).toHaveBeenCalledWith(chatId, MESSAGES.START_GENERATING);
      expect(mockTelegramBot.sendMessage).toHaveBeenCalledWith(chatId, summaryText);
  });
});
