$ErrorActionPreference = "Stop"

Write-Host "Starting Quantro Environment Setup..." -ForegroundColor Cyan

Write-Host "`nSetting up Quantro Main (Node.js)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to install Node dependencies for Quantro Main"; exit 1 }

Write-Host "`nSetting up Chatbot Server (Python)..." -ForegroundColor Yellow
$chatbotDir = ".\chatbot-server"
if (Test-Path $chatbotDir) {
    if (Get-Command python -ErrorAction SilentlyContinue) {
        Write-Host "   Installing Python requirements..." -ForegroundColor Gray
        pip install -r "$chatbotDir\requirements.txt"
        if ($LASTEXITCODE -ne 0) { Write-Host "   Warning: Pip install failed. Check if python/pip is in PATH." -ForegroundColor Red }
    }
    else {
        Write-Warning "Python not found! Skipping chatbot setup."
    }
}
else {
    Write-Error "Chatbot directory not found at $chatbotDir"
}

$baseFeaturesDir = ".."
$services = @("news", "status", "global-entry-drops-main\web\server")

foreach ($service in $services) {
    $svcPath = Join-Path $baseFeaturesDir $service
    if (Test-Path $svcPath) {
        Write-Host "`nSetting up Service: $service..." -ForegroundColor Yellow
        Push-Location $svcPath
        if (Test-Path "package.json") {
            try {
                npm install
            }
            catch {
                Write-Warning "Failed to install dependencies for $service"
            }
        }
        else {
            Write-Warning "No package.json found in $service"
        }
        Pop-Location
    }
    else {
        Write-Host "   (Skipping $service - Directory not found)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "Setup Complete! You can now run .\start-all.ps1" -ForegroundColor Green
