export interface IScraperStrategy {
  fetch(url: string): Promise<string>;
}
