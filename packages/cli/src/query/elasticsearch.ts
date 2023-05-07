import ElasticsearchClient from '../clients/elasticsearch';
import OpenAIClient from '../clients/openai';

export default class ElasticsearchQuery implements Query {
  private openaiClient: OpenAIClient;
  private elasticsearchClient: ElasticsearchClient;

  constructor() {
    this.openaiClient = OpenAIClient.getInstance();
    this.elasticsearchClient = ElasticsearchClient.getInstance();
  }

  public async query(prompt: string): Promise<string> {
    if (await this.openaiClient.passesModeration(prompt)) {
      const embedding = await this.openaiClient.generateEmbedding(prompt);
      const response = await this.elasticsearchClient.search(embedding);
      let context = '';
      let totalTokens = 0;
      for (const hit of response.hits.hits) {
        const text = hit.fields.text[0] as string;
        const textTokens = this.openaiClient.countTokens(text);
        // TODO: worth adding a partial context here?
        if (
          this.openaiClient.getAvailablePromptTokens(textTokens + totalTokens) >
          0
        ) {
          context += hit.fields.text[0];
        }
        totalTokens += textTokens;
      }
      const completion = await this.openaiClient.prompt(context, prompt);
      return completion;
    }
    return 'Prompt did not pass moderation';
  }
}
