#!/usr/bin/env node

import { Command } from 'commander';
import Indexer from './indexer';
import getConfiguration from './configuration';
import ElasticsearchQuery from './query/elasticsearch';
import ElasticsearchPersistence from './persistence/elasticsearch';

const script = new Command();

// TODO: replace
getConfiguration();

script
  .name('scrapac')
  .description('A tool to index files')
  .command('index')
  .argument('<directory>', 'The directory containing the files to index')
  .action(async (directory) => {
    const indexer = new Indexer();
    await indexer.index(directory);
  });

script
  .name('scrapac')
  .description('A tool to index files')
  .command('ask')
  .argument('<prompt>', 'The prompt')
  .action(async (prompt) => {
    const sanitized = prompt.replace(/\r\n/g, '');
    const query = new ElasticsearchQuery();
    process.stdout.write(await query.query(sanitized));
    process.stdout.write('\n');
  });

script
  .name('scrapac')
  .description('A tool to index files')
  .command('init')
  .action(async () => {
    const persistence = new ElasticsearchPersistence();
    await persistence.init();
  });

script.parse();
