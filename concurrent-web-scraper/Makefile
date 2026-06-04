# Run `make` (or `make help`) to see targets.
# On Windows, install make via `choco install make`, or use run.ps1 instead.

.PHONY: help setup cli web http test build tidy certs clean

help:           ## Show this help
	@echo Targets:
	@echo "  make setup  - one-time: download deps & fix go.sum (run first)"
	@echo "  make cli    - run the CLI scraper (urls.txt -> results.txt)"
	@echo "  make web    - run the web UI over HTTPS"
	@echo "  make http   - run the web UI over plain HTTP (no cert warning)"
	@echo "  make test   - run all tests"
	@echo "  make build  - compile both binaries into ./bin"
	@echo "  make tidy   - go mod tidy"
	@echo "  make clean  - remove ./bin and results.txt"

setup:          ## One-time: download deps & fix go.sum (run first)
	go get golang.org/x/net/html/charset
	go mod tidy

cli:            ## Run the CLI scraper
	go run ./cmd/scraper

web:            ## Run the web UI (HTTPS)
	go run ./cmd/web

http:           ## Run the web UI (plain HTTP)
	go run ./cmd/web -http

test:           ## Run tests
	go test ./...

build:          ## Build both binaries into ./bin
	go build -o bin/scraper ./cmd/scraper
	go build -o bin/web ./cmd/web

tidy:           ## Tidy modules
	go mod tidy

certs:          ## Generate a trusted local HTTPS cert (needs mkcert)
	mkcert -install
	mkdir -p certs
	mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1

clean:          ## Remove build output
	go clean
	rm -rf bin results.txt
