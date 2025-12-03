import { IScraperStrategy } from './strategies/ScraperStrategy.interface';
import { ScraperError } from '../../errors/ScraperError';

export class ScraperService {
  constructor(
    private staticStrategy: IScraperStrategy,
    private dynamicStrategy: IScraperStrategy
  ) {}

  async fetchContent(url: string): Promise<string> {
    try {
      return await this.staticStrategy.fetch(url);
    } catch (error) {
      if (error instanceof ScraperError && error.type === 'static') {
        console.warn(`Static scrape failed for ${url}, attempting dynamic scrape...`);
        return await this.dynamicStrategy.fetch(url);
      }
      throw error;
    }
  }
}
