import { IScraperStrategy } from './ScraperStrategy.interface';
import { ScraperError } from '../../../errors/ScraperError';

// abstraction for the browser instance to ease mocking and avoid hard dependency
export interface IBrowser {
  newPage(): Promise<IPage>;
  close(): Promise<void>;
}

export interface IPage {
  setRequestInterception(value: boolean): Promise<void>;
  on(event: string, handler: Function): void;
  goto(url: string, options?: any): Promise<any>;
  content(): Promise<string>;
  close(): Promise<void>;
}

export interface IBrowserLauncher {
  launch(): Promise<IBrowser>;
}

export class DynamicScraper implements IScraperStrategy {
  constructor(private browserLauncher: IBrowserLauncher) {}

  async fetch(url: string): Promise<string> {
    let browser: IBrowser | null = null;
    let page: IPage | null = null;

    try {
      browser = await this.browserLauncher.launch();

      try {
        page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (req: any) => {
          if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
          } else {
            req.continue();
          }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const content = await page.content();
        return content;

      } finally {
        if (page) await page.close();
      }

    } catch (error) {
      throw new ScraperError(
        `Dynamic fetch failed: ${(error as Error).message}`,
        'dynamic',
        error
      );
    } finally {
      if (browser) await browser.close();
    }
  }
}
