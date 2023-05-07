type Block = {
  title: string;
  text: string;
  vector?: Array<number>;
};

type Page = {
  title: string;
  overview: string;
  blocks: Array<Block>;
};

type Configuration = {
  elasticsearch: {
    url: string;
    username: string;
    password: string;
    index: string;
    ignoreTlsVerification: boolean;
  };
  openai: {
    maxRequestsPerMinute: number;
    apikey: string;
    embeddingsModel: string;
    embeddingsSize: number;
    completionModel: string;
  };
  web: {
    port: number;
  };
};

interface Processor {
  process(filePath: string): Promise<Page>;
}

interface EmbeddingsGenerator {
  generate(block: Block): Promise<Array<number>>;
}

interface Persistence {
  init(): Promise<void>;
  store(block: Block): Promise<string>;
}

interface Query {
  query(prompt: string): Promise<string>;
}

type ElasticsearchHit = {
  _source?: unknown;
  _id: string;
  fields: Record<string, Array<unknown>>;
};

type ElasticsearchResponse = {
  hits: {
    hits: Array<ElasticsearchHit>;
  };
};
