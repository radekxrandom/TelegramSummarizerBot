import { ScraperService } from './ScraperService';
import { IScraperStrategy } from './strategies/ScraperStrategy.interface';
import { ScraperError } from '../../errors/ScraperError';

describe('ScraperService', () => {
  let service: ScraperService;
  let mockStaticStrategy: jest.Mocked<IScraperStrategy>;
  let mockDynamicStrategy: jest.Mocked<IScraperStrategy>;

  beforeEach(() => {
    mockStaticStrategy = {
      fetch: jest.fn()
    };
    mockDynamicStrategy = {
      fetch: jest.fn()
    };
    service = new ScraperService(mockStaticStrategy, mockDynamicStrategy);
  });

  it('should use static strategy first', async () => {
    const url = 'https://example.com';
    mockStaticStrategy.fetch.mockResolvedValue('static content');

    const result = await service.fetchContent(url);

    expect(mockStaticStrategy.fetch).toHaveBeenCalledWith(url);
    expect(result).toBe('static content');
    expect(mockDynamicStrategy.fetch).not.toHaveBeenCalled();
  });

  it('should fallback to dynamic strategy if static fails with static error type', async () => {
    const url = 'https://example.com';
    // Throwing typed ScraperError
    mockStaticStrategy.fetch.mockRejectedValue(new ScraperError('Static failed', 'static'));
    mockDynamicStrategy.fetch.mockResolvedValue('dynamic content');

    const result = await service.fetchContent(url);

    expect(mockStaticStrategy.fetch).toHaveBeenCalledWith(url);
    expect(mockDynamicStrategy.fetch).toHaveBeenCalledWith(url);
    expect(result).toBe('dynamic content');
  });

  it('should throw if both strategies fail', async () => {
    const url = 'https://example.com';
    mockStaticStrategy.fetch.mockRejectedValue(new ScraperError('Static failed', 'static'));
    mockDynamicStrategy.fetch.mockRejectedValue(new ScraperError('Dynamic failed', 'dynamic'));

    await expect(service.fetchContent(url)).rejects.toThrow('Dynamic failed');
  });
  
  it('should rethrow unknown errors from static strategy without fallback', async () => {
      const url = 'https://example.com';
      mockStaticStrategy.fetch.mockRejectedValue(new Error('Unexpected Error'));
      
      await expect(service.fetchContent(url)).rejects.toThrow('Unexpected Error');
      expect(mockDynamicStrategy.fetch).not.toHaveBeenCalled();
  });
});
