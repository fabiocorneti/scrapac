import config = require('config');

function getDefault(key, value): unknown {
  return config.has(key) ? config.get(key) : value;
}

// TODO: validate config, normalize url etc.
export default function getConfiguration(): Configuration {
  return {
    elasticsearch: {
      url: config.get('elasticsearch.url'),
      username: config.get('elasticsearch.username'),
      password: config.get('elasticsearch.password'),
      index: config.get('elasticsearch.index'),
      ignoreTlsVerification: getDefault('elasticsearch.ignoreTlsVerification', false) as boolean
    },
    openai: {
      maxRequestsPerMinute: getDefault('openai.maxRequestsPerMinute', 60) as number,
      apikey: config.get('openai.apikey'),
      embeddingsModel: getDefault('openai.embeddingsModel', 'text-embedding-ada-002') as string,
      embeddingsSize: getDefault('openai.embeddingsSize', 1536) as number,
      completionModel: getDefault('openai.completionModel', 'gpt-3.5-turbo') as string
    },
    web: {
      port: getDefault('web.port', 3000) as number
    }
  };
}
