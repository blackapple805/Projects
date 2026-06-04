# concurrent-web-scraper

A concurrent web scraper in Go. Fetches URLs in parallel with a bounded worker
pool, extracts each page's title and best-available description, and reports
results in input order. Ships with a CLI and an HTTPS browser UI that share one
scraping package.

## Layout

```
.
├── cmd/
│   ├── scraper/      # CLI: reads urls.txt, writes results.txt
│   │   └── main.go
│   └── web/          # browser UI over HTTPS (or -http)
│       ├── main.go
│       └── index.go  # embedded single-page UI
├── internal/
│   └── scrape/       # shared core: fetching + extraction (no duplication)
│       ├── scrape.go
│       ├── extract.go
│       └── extract_test.go
├── urls.txt          # input, one URL per line (# comments allowed)
├── go.mod
└── go.sum
```

The standard `cmd/` + `internal/` layout keeps each binary thin and the
scraping logic in one place, so the CLI and web server can never drift apart.

## Run

```bash
go mod tidy

# CLI
go run ./cmd/scraper                      # urls.txt -> results.txt
go run ./cmd/scraper -c 16 -timeout 20s   # tune concurrency / timeout
go run ./cmd/scraper -in sites.txt -out out.txt

# Web UI
go run ./cmd/web          # HTTPS on https://localhost:8443 (self-signed)
go run ./cmd/web -http    # plain HTTP, no browser warning
go run ./cmd/web -addr :9000

# Tests
go test ./...
```

## How extraction works

Many sites have no `<p>` near the top — content is JS-rendered or built from
`<div>`s. Rather than give up, the scraper tries a cascade and reports which
source it used:

1. First real `<p>` (>20 chars)
2. `<meta name="description">`
3. Open Graph `og:description`
4. JSON-LD `description`

If a response is a bot-challenge page (HTTP 403/429, or a "Just a moment" /
"verification" title), the result is flagged `blocked` with an explanation
rather than a blank `N/A`.

## Test sites that allow scraping

`urls.txt` ships with sandboxes and open content built for this:

- `books.toscrape.com`, `quotes.toscrape.com` — purpose-built scraping sandboxes
- `scrapethissite.com/pages` — scraping practice site
- `httpbin.org/html` — returns a known HTML document
- `example.com`, Wikipedia — stable, scraping-friendly

Sites like Google, Reddit, and Stack Overflow actively block non-browser
clients (Cloudflare, bot walls), so they will show as `blocked`. That's the
site's choice, not a scraper bug.

## Notable design points

- Ordered, race-free results (each worker writes its own slice index)
- UTF-8 transcoding via `charset.NewReader` (no mojibake)
- Full element-text extraction (nested inline tags included)
- Per-request timeout and bounded concurrency, both configurable
- Context-aware: the web server cancels in-flight scrapes if the client leaves

## Trusted local HTTPS (no browser warning)

By default the web UI uses a self-signed cert, so the browser warns once. To
get a real green padlock with no warning, use [mkcert](https://github.com/FiloSottile/mkcert):

```bash
# 1. Install mkcert (Windows, via Chocolatey):
choco install mkcert

# 2. Install the local CA into your OS/browser trust store (one time):
mkcert -install

# 3. Generate a localhost cert into ./certs:
mkdir certs
mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1
```

Now `go run ./cmd/web` picks up those files automatically and serves trusted
HTTPS. If the files aren't present, it falls back to the self-signed cert, so
the project still runs for anyone who clones it without mkcert.
