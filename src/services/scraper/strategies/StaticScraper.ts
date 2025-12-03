import { AxiosInstance } from 'axios';
import { IScraperStrategy } from './ScraperStrategy.interface';
import { ScraperError } from '../../../errors/ScraperError';

export class StaticScraper implements IScraperStrategy {
  constructor(private axios: AxiosInstance) {}

  fetch = async (url: string): Promise<string> => {
    try {
      const response = await this.axios.get(url);
      return response.data;
    } catch (error) {
      throw new ScraperError(
        `Static fetch failed: ${(error as Error).message}`,
        'static',
        error
      );
    }
  };
}
