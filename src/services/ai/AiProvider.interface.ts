export interface IAiProvider {
  generateSummary(text: string, instructions?: string): Promise<string>;
}
