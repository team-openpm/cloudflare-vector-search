# LawGPT Search

A vector search API for legal documents powered by Cloudflare Workers, D1, and Vectorize. This API allows you to submit legal documents, search through them semantically, and get AI-powered answers to legal questions.

## Features

- Document submission with automatic text chunking and embedding
- Semantic search across documents
- AI-powered question answering using the document context
- Namespace support for document organization
- Built on Cloudflare's edge infrastructure

## Setup

1. Clone this repository
2. Set up a [Cloudflare](https://www.cloudflare.com/) Page with their admin
3. Run the setup commands:

```bash
pnpm
pnpm setup-cloudflare
pnpm load-schema
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `AUTH_SECRET`: A secret used to authenticate requests to the API (optional)

## API Endpoints

### Submit a Document

Submit a new document to be indexed:

```bash
curl -X POST http://localhost:8787/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-secret" \
  -d '{
    "url": "https://example.com/legal-doc",
    "text": "Your legal document text here",
    "namespace": "contracts"
  }'
```

### Search Documents

Search through indexed documents:

```bash
curl -X POST http://localhost:8787/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-secret" \
  -d '{
    "query": "What are the termination clauses?",
    "namespace": "contracts"
  }'
```

### Ask Questions

Get AI-powered answers based on the document context:

```bash
curl -X POST http://localhost:8787/answer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-secret" \
  -d '{
    "query": "What are my rights under this contract?",
    "namespace": "contracts"
  }'
```

## Development

Run the development server:

```bash
pnpm dev
```

## API Schema

Full OpenAPI schema available at `/openapi.json` endpoint.

## Technical Details

- Uses Cloudflare D1 for document storage
- Cloudflare Vectorize for embedding storage and similarity search
- Text
