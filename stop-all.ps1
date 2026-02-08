Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Quantro Ecosystem Shutdown (Fast)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Stop Background Jobs (Fastest)
$jobs = Get-Job
if ($jobs) {
    Write-Host "Stopping $($jobs.Count) background job(s)..." -ForegroundColor Yellow
    # Force removal kills the job immediately without waiting for graceful shutdown
    $jobs | Remove-Job -Force -ErrorAction SilentlyContinue 
    Write-Host "  Background jobs removed" -ForegroundColor Green
}

# 2. Kill Processes by Port (Batched)
$ports = @(5500, 3000, 5173, 8787, 4000, 8001)
Write-Host "Checking ports: $($ports -join ', ')..." -ForegroundColor Yellow

# Faster filter: ask Windows for only the ports we care about
$connections = Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue

if ($connections) {
    $uniquePids = $connections.OwningProcess | Select-Object -Unique
    foreach ($pid_num in $uniquePids) {
        # Skip Get-Process for speed, just kill
        Stop-Process -Id $pid_num -Force -ErrorAction SilentlyContinue
        Write-Host "  Killed PID: $pid_num" -ForegroundColor Red
    }
} else {
    Write-Host "  No active listeners found on target ports." -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Shutdown complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
