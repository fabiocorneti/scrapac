# Scrapac

Toying with OpenAI and Elasticsearch/Opensearch.

## Development

- Clone the repo.
- Install deps:

```bash
yarn
```
- Build

```bash
yarn build
```

- Copy `config/sample.yaml` to `config/default.yml` and set your Elasticsearch credentials, your Elasticsearch URL and your OpenAI Key.
- Start Elasticsearch.
- Initialize the index:

```bash
./scrapac init
```

## Indexing a website

Not available yet.

## Indexing a directory of markdown / asciidoc files.

```bash
./scrapac index <directory>
```

## Asking a question

```bash
./scrapac ask "How are you?"
```
## Web UI

```bash
./scrapac serve
```

Then visit http://localhost:3000 . Note that no authentication or TLS are currently available, so be careful.
