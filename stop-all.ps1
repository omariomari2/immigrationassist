Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Quantro Ecosystem Shutdown (Fast)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Stop Background Jobs (Fastest)
$jobs = Get-Job
if ($jobs) {
    Write-Host "Stopping $($jobs.Count) background job(s)..." -ForegroundColor Yellow
    $jobs | Stop-Job -PassThru | Remove-Job
    Write-Host "  Background jobs removed" -ForegroundColor Green
}

# 2. Kill Processes by Port (Batched)
$ports = @(5500, 3000, 5173, 8787, 4000, 8001)
Write-Host "Checking ports: $($ports -join ', ')..." -ForegroundColor Yellow

# Single WMI call (much faster than looping)
$connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in $ports }

if ($connections) {
    $uniquePids = $connections.OwningProcess | Select-Object -Unique
    foreach ($pid_num in $uniquePids) {
        # Optional: Get name for UI (can be skipped for max speed, but nice to have)
        $proc = Get-Process -Id $pid_num -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Killing $($proc.Name) (PID: $pid_num)..." -ForegroundColor Red
            Stop-Process -Id $pid_num -Force -ErrorAction SilentlyContinue
        }
    }
} else {
    Write-Host "  No active listeners found on target ports." -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Shutdown complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
