# cloudflare vector search

## Usage

### Submitting

```bash
curl -X POST -H "Content-Type: application/json" -d '{"text": "cloudflare"}' "http://127.0.0.1:8788/api/submit"
```

### Searching

```bash
curl "http://127.0.0.1:8788/api/search?query=cloudflare"
```
