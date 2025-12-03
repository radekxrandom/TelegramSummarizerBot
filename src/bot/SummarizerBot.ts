import TelegramBot from 'node-telegram-bot-api';
import { ScraperService } from '../services/scraper/ScraperService';
import { IAiProvider } from '../services/ai/AiProvider.interface';
import { TextProcessor } from '../utils/TextProcessor';
import { MESSAGES } from '../constants/messages';
import { ChatId } from '../types/ChatId';

export class SummarizerBot {
  private bot: TelegramBot;
  private scraper: ScraperService;
  private ai: IAiProvider;
  private activeRequests: Set<ChatId>;

  constructor(bot: TelegramBot, scraper: ScraperService, ai: IAiProvider) {
    this.bot = bot;
    this.scraper = scraper;
    this.ai = ai;
    this.activeRequests = new Set();
    this.initialize();
  }

  private initialize() {
    this.bot.on('message', this.handleMessage.bind(this));
    this.bot.on('polling_error', (error: Error) => console.error(`Polling error: ${error.message}`));
    console.log('SummarizerBot initialized and listening...');
  }

  private async handleMessage(msg: TelegramBot.Message) {
    // Ignore bot messages and short/empty messages
    if (msg.from?.is_bot || !msg.text) return;

    const chatId: ChatId = msg.chat.id;
    const text = msg.text;

    // Check for URL
    const url = TextProcessor.extractUrl(text);
    if (!url) {
        // UX Polish: Polite hint instead of silent ignore for likely queries
        if (text.toLowerCase().includes('summarize') || text.toLowerCase().includes('tldr')) {
            await this.bot.sendMessage(chatId, MESSAGES.ERROR_NO_URL);
        }
        return;
    }

    // Throttling: One request per chat at a time
    if (this.activeRequests.has(chatId)) {
        await this.bot.sendMessage(chatId, MESSAGES.ERROR_TOO_MANY_REQUESTS);
        return;
    }

    this.activeRequests.add(chatId);

    const instructions = TextProcessor.extractInstructions(text);

    try {
      await this.bot.sendMessage(chatId, MESSAGES.START_READING);

      const html = await this.scraper.fetchContent(url);
      const cleanText = TextProcessor.cleanHtml(html);

      const truncatedText = TextProcessor.truncate(cleanText, 15000);

      if (!truncatedText || truncatedText.length < 50) {
        await this.bot.sendMessage(chatId, MESSAGES.ERROR_NO_TEXT);
        this.activeRequests.delete(chatId);
        return;
      }

      await this.bot.sendMessage(chatId, MESSAGES.START_GENERATING);

      const summary = await this.ai.generateSummary(truncatedText, instructions);

      await this.sendSplitMessage(chatId, summary);

    } catch (error) {
      console.error("Error processing message:", error);
      await this.bot.sendMessage(chatId, MESSAGES.ERROR_GENERIC);
    } finally {
        this.activeRequests.delete(chatId);
    }
  }

  private async sendSplitMessage(chatId: ChatId, text: string) {
    const MAX_LENGTH = 4096;
    if (text.length <= MAX_LENGTH) {
      await this.bot.sendMessage(chatId, text);
      return;
    }

    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= MAX_LENGTH) {
        await this.bot.sendMessage(chatId, remaining);
        break;
      }

      let splitIdx = remaining.lastIndexOf('\n', MAX_LENGTH);
      if (splitIdx === -1) splitIdx = remaining.lastIndexOf(' ', MAX_LENGTH);
      if (splitIdx === -1) splitIdx = MAX_LENGTH;

      await this.bot.sendMessage(chatId, remaining.slice(0, splitIdx));
      remaining = remaining.slice(splitIdx).trimStart();
    }
  }
}
