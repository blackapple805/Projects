# Single-entry runner for Windows. Usage:
#   .\run.ps1 setup   # one-time: download deps & fix go.sum  <-- run this first
#   .\run.ps1 cli     # CLI scraper
#   .\run.ps1 web     # web UI (HTTPS)
#   .\run.ps1 http    # web UI (plain HTTP)
#   .\run.ps1 test    # run tests
#   .\run.ps1 build   # build both binaries into .\bin
#   .\run.ps1 certs   # generate trusted local HTTPS cert (needs mkcert)
param([string]$task = "help")

switch ($task) {
    "setup" {
        Write-Host "Resolving dependencies..." -ForegroundColor Cyan
        go get golang.org/x/net/html/charset
        go mod tidy
        Write-Host "Done. Run '.\run.ps1 test' to verify, then '.\run.ps1 web'." -ForegroundColor Green
    }
    "cli"   { go run ./cmd/scraper }
    "web"   { go run ./cmd/web }
    "http"  { go run ./cmd/web -http }
    "test"  { go test ./... }
    "build" {
        go build -o bin/scraper.exe ./cmd/scraper
        go build -o bin/web.exe ./cmd/web
        Write-Host "Built bin\scraper.exe and bin\web.exe"
    }
    "tidy"  { go mod tidy }
    "certs" {
        if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
            Write-Host "mkcert not found. Install it first: choco install mkcert" -ForegroundColor Yellow
            break
        }
        mkcert -install
        if (-not (Test-Path certs)) { New-Item -ItemType Directory certs | Out-Null }
        mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1
        Write-Host "Trusted cert written to .\certs. Now run '.\run.ps1 web'." -ForegroundColor Green
    }
    default {
        Write-Host "Usage: .\run.ps1 <task>"
        Write-Host "  setup  - one-time: download deps & fix go.sum (run first)"
        Write-Host "  cli    - CLI scraper (urls.txt -> results.txt)"
        Write-Host "  web    - web UI over HTTPS"
        Write-Host "  http   - web UI over plain HTTP (no warning)"
        Write-Host "  test   - run all tests"
        Write-Host "  build  - compile both binaries into .\bin"
        Write-Host "  certs  - generate trusted local HTTPS cert (needs mkcert)"
    }
}
