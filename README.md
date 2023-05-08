# cloudflare vector search

This project is a Cloudflare Page that allows you to perform a semantic search over a set of documents.

Essentially you can search for meaning, not just keywords.

The nice thing about using Cloudflare is that it's incredibly fast and cheap. You can deploy this to a free Cloudflare Page and it will scale to millions of documents.

See below for examples on how to submit and search documents.

For large documents, we support a bulk submit endpoint that will automatically split your document into paragraphs and index each paragraph separately.

## Usage

### Submitting

```bash
curl -X POST -H "Content-Type: application/json" -d '{"text": "cloudflare"}' "http://127.0.0.1:8788/api/submit"
```

### Submitting large documents

```bash
curl -X POST -H "Content-Type: application/json" -d '{"text": "big document"}' "http://127.0.0.1:8788/api/bulk-submit"
```

### Searching

```bash
curl "http://127.0.0.1:8788/api/search?query=cloudflare"
```

## Additional options

You can pass a `namespace` parameter to both the submit and search endpoints to namespace your queries.

```bash
curl -X POST -H "Content-Type: application/json" -d '{"text": "cloudflare", "namespace": "my-namespace"}' "http://127.0.0.1:8788/api/submit"
```

And then:

```bash
curl "http://127.0.0.1:8788/api/search?query=cloudflare&namespace=my-namespace"
```

A namespace could be a user ID, a document ID, or anything else you want to use to group your queries.

You can also pass in a key/value `metadata` object to the submit endpoint to store additional data about your query.

## Deployment

### Database

`cloudflare-vector-search` uses a Postgres database to store the vectors. We recomment using [Neon](https://neon.tech).

Sign up for a free account and paste in the schema from `data/schema.sql` into the SQL editor.

### Cloudflare

Clone this repo and then set up a [Cloudflare](https://www.cloudflare.com/) Page with their admin.

We expect the following env vars:

- `DATABASE_URL`: The URL to your Postgres database
- `OPENAI_API_KEY`: Your OpenAI API key
- `AUTH_SECRET`: A secret used to authenticate requests to the API (optional)
