import bottleneck from 'bottleneck';
import { encode } from 'gpt-3-encoder';
import { OpenAIApi, Configuration as OpenAIConfiguration } from 'openai';

import getConfiguration from '../configuration';
import { formatAxiosError } from '../axios';
import Logger from '../logger';

// Max number of concurrent requests to OpenAPI as of 2023-04
const MAX_CONCURRENT = 10;

// Max number of tokens (prompt + response) - Absolute max is 4097 as of 2023-04
const MAX_TOKENS_REQUEST = 3000;
const MAX_TOKENS_RESPONSE = 1000;

export default class OpenAIClient {
  private static instance: OpenAIClient | undefined;

  private configuration: Configuration;
  private api: OpenAIApi;
  private limiter: bottleneck;

  private constructor(configuration: Configuration) {
    this.configuration = configuration;
    const openaiConfig = new OpenAIConfiguration({
      apiKey: configuration.openai.apikey
    });
    this.api = new OpenAIApi(openaiConfig);
    const maxConcurrent = Math.ceil(
      configuration.openai.maxRequestsPerMinute / MAX_CONCURRENT
    );
    this.limiter = new bottleneck({
      maxConcurrent: maxConcurrent,
      minTime: 60000 / configuration.openai.maxRequestsPerMinute
    });
  }

  static getInstance(): OpenAIClient {
    if (!this.instance) {
      this.instance = new OpenAIClient(getConfiguration());
    }
    return this.instance;
  }

  public preparePrompt(context: string, prompt: string): string {
    const aiPrompt = `Given the context below and what you already know, answer my question, use Markdown, and provide code samples if possible.

${context}

Question:
${prompt}
`;
    return aiPrompt;
  }

  public countTokens(text: string): number {
    return encode(text).length;
  }

  public getAvailablePromptTokens(tokens: number): number {
    return MAX_TOKENS_REQUEST - tokens;
  }

  public async generateEmbedding(text: string): Promise<Array<number>> {
    return (await this.limiter.wrap(async (): Promise<Array<number>> => {
      try {
        const response = await this.api.createEmbedding({
          model: this.configuration.openai.embeddingsModel,
          input: text
        });
        return response.data.data[0].embedding;
      } catch (e) {
        throw new Error(formatAxiosError(e));
      }
    })()) as unknown as Promise<Array<number>>;
  }

  public async passesModeration(prompt: string): Promise<boolean> {
    return (await this.limiter.wrap(async (): Promise<boolean> => {
      try {
        const response = await this.api.createModeration({
          input: prompt
        });
        const results = response.data.results[0];
        return !results.flagged;
      } catch (e) {
        throw new Error(formatAxiosError(e));
      }
    })()) as unknown as Promise<boolean>;
  }

  public async prompt(context: string, prompt: string): Promise<string> {
    const aiPrompt = this.preparePrompt(context, prompt);
    try {
      const response = await this.api.createChatCompletion({
        model: this.configuration.openai.completionModel,
        messages: [
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0,
        max_tokens: MAX_TOKENS_RESPONSE
      });

      const results = response.data.choices[0].message.content;
      return results;
    } catch (e) {
      throw new Error(formatAxiosError(e));
    }
  }

  /*
  public streamingPrompt(context: string, prompt: string): void {
    const aiPrompt = this.preparePrompt(context, prompt);
    try {
      const response = await this.api.createChatCompletion({
        model: this.configuration.openai.completionModel,
        messages: [
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0,
        max_tokens: MAX_TOKENS_RESPONSE
      });

      const results = response.data.choices[0].message.content;
      return results;
    } catch (e) {
      throw new Error(formatAxiosError(e));
    }
  }
  */
}
