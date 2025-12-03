export type ScraperErrorType = 'static' | 'dynamic';

export class ScraperError extends Error {
  constructor(
    message: string,
    public readonly type: ScraperErrorType,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ScraperError';
  }
}


