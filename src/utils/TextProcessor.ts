import * as cheerio from 'cheerio';
import { PATTERNS } from '../constants/patterns';

export class TextProcessor {
  static extractUrl(text: string): string | undefined {
    const match = text.match(PATTERNS.URL);
    return match ? match[0] : undefined;
  }

  static extractInstructions(text: string): string {
    const instructions = text.replace(PATTERNS.URL_GLOBAL, '').replace(PATTERNS.WHITESPACE, ' ').trim();
    return instructions || "Summarize this content:";
  }

  static cleanHtml(html: string): string {
    const $ = cheerio.load(html);

    $('script, style, noscript, iframe, svg, header, footer, nav').remove();

    let text = $('body').text();

    text = text.replace(PATTERNS.WHITESPACE, ' ').trim();

    return text;
  }

  static truncate(text: string, maxLength: number = 15000): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '... [truncated]';
  }
}
