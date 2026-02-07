Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Quantro Ecosystem Shutdown" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$jobs = Get-Job | Where-Object { $_.Name -in @("Quantro Main", "News Provider", "Status Dashboard", "DeepSeek Proxy", "Global Entry API") }

if ($jobs.Count -gt 0) {
    Write-Host "Stopping $($jobs.Count) background job(s)..." -ForegroundColor Yellow
    $jobs | Stop-Job -PassThru | Remove-Job
    Write-Host "  Background jobs removed" -ForegroundColor Green
}

$ports = @(5500, 3000, 5173, 8787, 4000)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    
    if ($connections) {
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Stopping process on port $port (PID: $($process.Id), Name: $($process.Name))..." -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "  Port $port cleared" -ForegroundColor Green
    }
    else {
        Write-Host "  Port $port - no process found" -ForegroundColor DarkGray
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Shutdown complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
