import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Agent } from 'https';
import getConfiguration from '../configuration';
import { formatAxiosError } from '../axios';

export default class ElasticsearchClient {
  private static instance: ElasticsearchClient;

  private axiosClient: AxiosInstance;
  private configuration: Configuration;
  private requestOptions: AxiosRequestConfig;

  private constructor(configuration: Configuration) {
    this.configuration = configuration;
    this.axiosClient = axios.create({
      baseURL: configuration.elasticsearch.url,
      timeout: 30000,
      httpsAgent: new Agent({
        rejectUnauthorized: !configuration.elasticsearch.ignoreTlsVerification
      })
    });
    this.requestOptions = {
      auth: {
        username: this.configuration.elasticsearch.username,
        password: this.configuration.elasticsearch.password
      }
    };
  }

  public static getInstance(): ElasticsearchClient {
    if (!this.instance) {
      this.instance = new ElasticsearchClient(getConfiguration());
    }
    return this.instance;
  }

  /**
   * Stores a block in Elasticsearch as a new document with an automatic generated _id.
   * @returns a promise with the _id of the document.
   */
  public async store(block: Block): Promise<string> {
    const response = await this.axiosClient.post(
      `${this.configuration.elasticsearch.index}/_doc`,
      {
        title: block.title,
        text: block.text,
        vector: block.vector
      },
      this.requestOptions
    );
    return response.data._id;
  }

  /**
   * Executes a knn search and returns a raw response.
   *
   * @param vector The vector to search.
   * @returns A promise with the raw response.
   */
  public async search(vector: Array<number>): Promise<ElasticsearchResponse> {
    // TODO: using scriptScore until the release that allows to index up to 2048 lands
    // Could use OpenSearch as well in the meantime or look at custom models for ES ML.
    const response = await this.axiosClient.post(
      `${this.configuration.elasticsearch.index}/_search?size=10`,
      {
        _source: false,
        fields: ['title', 'text'],
        query: {
          script_score: {
            query: {
              match_all: {}
            },
            script: {
              source: "cosineSimilarity(params.query_vector, 'vector') + 1.0",
              params: {
                query_vector: vector
              }
            }
          }
        }
      },
      this.requestOptions
    );
    return response.data;
  }

  public async createIndex() {
    try {
      await this.axiosClient.delete(
        `${this.configuration.elasticsearch.index}?ignore_unavailable=true`,
        this.requestOptions
      );
    } catch (e) {
      throw new Error(
        `Could not delete Elasticsearch index. Details: ${formatAxiosError(e)}`
      );
    }
    try {
      await this.axiosClient.put(
        `${this.configuration.elasticsearch.index}`,
        {
          settings: {
            number_of_shards: 3,
            number_of_replicas: 1
          },
          mappings: {
            properties: {
              title: {
                type: 'text'
              },
              vector: {
                type: 'dense_vector',
                dims: this.configuration.openai.embeddingsSize
              },
              text: {
                type: 'text'
              }
            }
          }
        },
        this.requestOptions
      );
    } catch (e) {
      throw new Error(
        `Could not create Elasticsearch index. Details: ${formatAxiosError(e)}`
      );
    }
  }
}
