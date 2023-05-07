import OpenAIClient from '../clients/openai';

export default class OpenAIEmbeddingsGenerator implements EmbeddingsGenerator {
  private client: OpenAIClient;

  constructor() {
    this.client = OpenAIClient.getInstance();
  }

  public async generate(block: Block): Promise<Array<number>> {
    return await this.client.generateEmbedding(
      `# ${block.title}\n\n${block.text}`
    );
  }
}
