import { Dirent } from 'fs';
import { readdir } from 'fs/promises';
import { extname, join } from 'path';

import AsciiDocProcessor from './processors/asciidoc';
import OpenAiEmbeddingsGenerator from './embeddings/openai';
import ElasticsearchPersistence from './persistence/elasticsearch';

const PROCESSORS: { [key: string]: Processor } = {
  '.adoc': new AsciiDocProcessor(),
};

export default class Indexer {
  private persistence: Persistence;
  private generator: EmbeddingsGenerator;

  constructor() {
    this.generator = new OpenAiEmbeddingsGenerator();
    this.persistence = new ElasticsearchPersistence();
  }

  private async processFile(parent: string, file: Dirent): Promise<void> {
    const fullPath = join(parent, file.name);
    if (file.isDirectory()) {
      this.traverse(fullPath);
    } else {
      const processor = PROCESSORS[extname(file.name)];
      if (processor) {
        let page;
        try {
          page = await PROCESSORS[extname(file.name)].process(fullPath);
          for (const block of page.blocks) {
            block.vector = await this.generator.generate(block);
            await this.persistence.store(block);
          }
        } catch (e) {
          process.stderr.write(
            `An error occurred processing file ${fullPath}\n`
          );
          process.exit(1);
        }
      }
    }
  }

  private async traverse(path: string): Promise<void> {
    const files = await readdir(path, { withFileTypes: true });
    const promises = files.map((file) => this.processFile(path, file));
    await Promise.all(promises);
  }

  public async index(path: string): Promise<void> {
    return await this.traverse(path);
  }
}
