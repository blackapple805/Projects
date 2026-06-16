# start.ps1 — bring up the ELK stack and configure Kibana in one command.
# Usage:  .\start.ps1
#
# Fixes the earlier hang by polling the Kibana API directly and retrying
# until it answers, instead of checking a version-specific status field.

$ErrorActionPreference = "Stop"

Write-Host "Starting ELK stack..." -ForegroundColor Cyan
docker compose up -d

$uri  = "http://localhost:5601/api/saved_objects/index-pattern/traffic"
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
        # 409 = it already exists -> success. Anything else -> Kibana still warming up.
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

Write-Host "`nReady -> http://localhost:5601" -ForegroundColor Green
Write-Host "In Discover, set the time range to 'Last 5 years' (data is from Oct 2023)." -ForegroundColor Green
Start-Process "http://localhost:5601/app/discover"
