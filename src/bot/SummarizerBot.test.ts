import { SummarizerBot } from './SummarizerBot';
import TelegramBot from 'node-telegram-bot-api';
import { ScraperService } from '../services/scraper/ScraperService';
import { IAiProvider } from '../services/ai/AiProvider.interface';
import { TextProcessor } from '../utils/TextProcessor';
import { MESSAGES } from '../constants/messages';

// Mock Node Telegram Bot Api
jest.mock('node-telegram-bot-api');
jest.mock('../utils/TextProcessor');

describe('SummarizerBot', () => {
  let bot: SummarizerBot;
  let mockTelegramBot: jest.Mocked<TelegramBot>;
  let mockScraper: jest.Mocked<ScraperService>;
  let mockAi: jest.Mocked<IAiProvider>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup dependencies
    mockTelegramBot = new TelegramBot('token', { polling: true }) as jest.Mocked<TelegramBot>;
    
    mockScraper = {
      fetchContent: jest.fn()
    } as any;

    mockAi = {
      generateSummary: jest.fn()
    };

    // Mock TextProcessor methods
    (TextProcessor.extractUrl as jest.Mock).mockImplementation((text) => {
        const match = text.match(/(https?:\/\/[^\s]+)/);
        return match ? match[0] : undefined;
    });
    (TextProcessor.extractInstructions as jest.Mock).mockReturnValue('instructions');
    (TextProcessor.cleanHtml as jest.Mock).mockReturnValue('clean text that is definitely long enough to pass the length check which requires fifty characters or more to proceed with summarization');
    (TextProcessor.truncate as jest.Mock).mockReturnValue('truncated text that is definitely long enough to pass the length check which requires fifty characters or more to proceed with summarization');

    // Initialize bot injecting the mock telegram bot
    bot = new SummarizerBot(mockTelegramBot, mockScraper, mockAi);
  });

  it('should initialize and listen for messages', () => {
    expect(mockTelegramBot.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  // Helper to simulate incoming message
  const simulateMessage = async (msg: Partial<TelegramBot.Message>) => {
    const messageHandler = mockTelegramBot.on.mock.calls.find(call => call[0] === 'message')![1];
    await messageHandler(msg as TelegramBot.Message);
  };

  it('should ignore messages from bots', async () => {
    await simulateMessage({
      message_id: 1,
      date: 123456,
      chat: { id: 1, type: 'private' },
      from: { is_bot: true, id: 1, first_name: 'Bot', is_premium: false },
      text: 'https://example.com'
    } as TelegramBot.Message);

    expect(mockScraper.fetchContent).not.toHaveBeenCalled();
  });

  it('should process valid url and reply with summary', async () => {
    const chatId = 123;
    const url = 'https://example.com';
    const summary = 'Great summary';

    mockScraper.fetchContent.mockResolvedValue('<html><body>Content</body></html>');
    mockAi.generateSummary.mockResolvedValue(summary);

    await simulateMessage({
      message_id: 2,
      date: 123456,
      chat: { id: chatId, type: 'private' },
      text: url,
      from: { is_bot: false, id: 1, first_name: 'User', is_premium: false }
    } as TelegramBot.Message);

    expect(mockScraper.fetchContent).toHaveBeenCalledWith(url);
    expect(mockAi.generateSummary).toHaveBeenCalledWith(
        expect.stringContaining('truncated text'), 
        'instructions'
    );
    expect(mockTelegramBot.sendMessage).toHaveBeenCalledWith(chatId, summary);
  });
  
  it('should send hint when no url is found in summarize command', async () => {
      const chatId = 456;
      (TextProcessor.extractUrl as jest.Mock).mockReturnValue(undefined);
      
      await simulateMessage({
          message_id: 4,
          date: 123,
          chat: { id: chatId, type: 'private' },
          text: 'Please summarize this',
          from: { is_bot: false, id: 1, first_name: 'User', is_premium: false }
      } as TelegramBot.Message);
      
      expect(mockTelegramBot.sendMessage).toHaveBeenCalledWith(chatId, MESSAGES.ERROR_NO_URL);
  });

  it('should throttle multiple requests from same chat', async () => {
      const chatId = 789;
      const url = 'https://example.com';
      
      // Make the first request hang slightly
      mockScraper.fetchContent.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('html'), 100)));
      // Ensure AI returns a string if it gets there (though it shouldn't for the second request)
      mockAi.generateSummary.mockResolvedValue('summary');
      
      const promise1 = simulateMessage({
          message_id: 5,
          date: 123,
          chat: { id: chatId, type: 'private' },
          text: url,
          from: { is_bot: false, id: 1, first_name: 'User', is_premium: false }
      } as TelegramBot.Message);
      
      // Immediate second request
      const promise2 = simulateMessage({
          message_id: 6,
          date: 123,
          chat: { id: chatId, type: 'private' },
          text: url,
          from: { is_bot: false, id: 1, first_name: 'User', is_premium: false }
      } as TelegramBot.Message);
      
      await Promise.all([promise1, promise2]);
      
      // One should succeed (start reading), one should fail (too many requests)
      // Or specifically, we check that we sent the error message at least once
      expect(mockTelegramBot.sendMessage).toHaveBeenCalledWith(chatId, MESSAGES.ERROR_TOO_MANY_REQUESTS);
  });

  it('should handle scraping errors gracefully', async () => {
    const chatId = 123;
    mockScraper.fetchContent.mockRejectedValue(new Error('Network Error'));

    await simulateMessage({
      message_id: 3,
      date: 123456,
      chat: { id: chatId, type: 'private' },
      text: 'https://example.com',
      from: { is_bot: false, id: 1, first_name: 'User', is_premium: false }
    } as TelegramBot.Message);
    
    expect(mockTelegramBot.sendMessage).toHaveBeenCalledWith(
        chatId, 
        MESSAGES.ERROR_GENERIC
    );
  });
});
