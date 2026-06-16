# start-https.ps1 — bring up the stack with HTTPS on Kibana, in one command.
# Usage:  .\start-https.ps1
#
# Generates a self-signed certificate the first time (valid for localhost),
# starts the stack with the HTTPS overlay, and creates the Kibana data view.
# Your browser will warn that the cert is self-signed — that's expected for a
# local lab; click "Advanced -> proceed to localhost".

$ErrorActionPreference = "Stop"

# 1. Generate a self-signed cert once, using a tiny openssl container.
if (-not (Test-Path ".\certs\kibana.crt")) {
    Write-Host "Generating self-signed certificate for localhost..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path ".\certs" | Out-Null
    docker run --rm -v "${PWD}\certs:/certs" alpine/openssl req -x509 -nodes `
        -newkey rsa:2048 -days 3650 `
        -keyout /certs/kibana.key -out /certs/kibana.crt `
        -subj "/CN=localhost" `
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    Write-Host "Certificate created in .\certs" -ForegroundColor Green
}

# 2. Start the stack WITH the HTTPS overlay (base file stays untouched).
Write-Host "Starting ELK stack with HTTPS on Kibana..." -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.https.yml up -d

# 3. Allow PowerShell to talk to the self-signed HTTPS endpoint.
#    (Works on both Windows PowerShell 5.1 and PowerShell 7.)
add-type @"
using System.Net; using System.Security.Cryptography.X509Certificates;
public class TrustAll : ICertificatePolicy {
    public bool CheckValidationResult(ServicePoint sp, X509Certificate cert, WebRequest req, int problem) { return true; }
}
"@ -ErrorAction SilentlyContinue
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAll
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

# 4. Wait for Kibana (HTTPS now) and create the data view, retrying until it answers.
$uri  = "https://localhost:5601/api/saved_objects/index-pattern/traffic"
$body = '{"attributes":{"title":"traffic*","timeFieldName":"@timestamp"}}'

Write-Host "Waiting for Kibana, then creating the 'traffic' data view..." -ForegroundColor Cyan
$done = $false
for ($i = 0; $i -lt 60 -and -not $done; $i++) {
    try {
        Invoke-RestMethod -Method Post -Uri $uri `
            -Headers @{ "kbn-xsrf" = "true" } -ContentType "application/json" `
            -Body $body | Out-Null
        $done = $true
        Write-Host "Data view created." -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            $done = $true
            Write-Host "Data view already exists." -ForegroundColor Yellow
        } else {
            Write-Host "  ...still warming up" -ForegroundColor DarkGray
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $done) {
    Write-Host "Kibana did not respond in time. Check: docker compose logs kibana" -ForegroundColor Red
    exit 1
}

Write-Host "`nReady -> https://localhost:5601" -ForegroundColor Green
Write-Host "Your browser will warn about the self-signed cert: Advanced -> proceed." -ForegroundColor Green
Write-Host "In Discover, set the time range to 'Last 5 years' (data is from Oct 2023)." -ForegroundColor Green
Start-Process "https://localhost:5601/app/discover"
