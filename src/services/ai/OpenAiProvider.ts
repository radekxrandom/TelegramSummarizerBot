import OpenAI from 'openai';
import { IAiProvider } from './AiProvider.interface';
import { config } from '../../config';
import { SYSTEM_PROMPTS } from '../../constants/messages';

const encodeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export class OpenAiProvider implements IAiProvider {
  constructor(private client: OpenAI) {}

  async generateSummary(text: string, instructions: string = 'summarize this website:'): Promise<string> {
    const safeInstructions = encodeXml(instructions);
    const safeText = encodeXml(text);

    const completion = await this.client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS.SUMMARIZER
        },
        {
          role: "user",
          content: `
            <user_instructions>
              ${safeInstructions}
            </user_instructions>

            <source_content>
              ${safeText}
            </source_content>
          `
        }
      ],
      model: config.openai.model,
      temperature: config.openai.defaults.temperature,
      max_tokens: config.openai.defaults.maxTokens,
    });

    const choice = completion.choices[0];
    if (!choice?.message?.content) {
      console.error("OpenAI returned empty choices or content", completion);
      throw new Error("OpenAI API returned invalid empty response");
    }

    return choice.message.content;
  }
}
