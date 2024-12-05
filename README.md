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

### 1. Search Documents

```bash
curl -X GET "http://localhost:8787/documents/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "your search query",
    "namespace": "default"
  }'
```

### 2. Submit Document

```bash
curl -X POST "http://localhost:8787/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-secret" \
  -d '{
    "url": "https://example.com/document",
    "text": "Your document text here",
    "namespace": "default"
  }'
```

### 3. Suggest Documents

```bash
curl -X POST "http://localhost:8787/documents/suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "document title search",
    "namespace": "default"
  }'
```

### 4. Retrieve Document

```bash
curl -X GET "http://localhost:8787/documents/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-secret"
```

### 5. Chat/Answer

```bash
curl -X POST "http://localhost:8787/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "your question about the documents",
    "namespace": "default"
  }'
```

### 6. Chat Document Suggestions

```bash
curl -X POST "http://localhost:8787/chat/suggest" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-auth-secret" \
  -d '{
    "query": "your question for document suggestions",
    "namespace": "default"
  }'
```

## Development

Run the development server:

```bash
pnpm dev
```

### Setup

```bash
pnpm setup-cloudflare
pnpm load-schema --remote
```
