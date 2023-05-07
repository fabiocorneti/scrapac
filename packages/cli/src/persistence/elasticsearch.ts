import ElasticsearchClient from '../clients/elasticsearch';

export default class ElasticsearchPersistence implements Persistence {
  private client: ElasticsearchClient;

  constructor() {
    this.client = ElasticsearchClient.getInstance();
  }

  public async store(block: Block): Promise<string> {
    return this.client.store(block);
  }

  public async init(): Promise<void> {
    await this.client.createIndex();
  }
}
