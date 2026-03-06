# Quick Test Runner - Chromium Only
# Runs tests quickly for development (5-10 minutes)

Write-Host "`n╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Quick Test Run (Chromium Only)        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝`n" -ForegroundColor Cyan

$startTime = Get-Date

# Run only chromium tests
npx playwright test --project=chromium

$duration = (Get-Date) - $startTime
$exitCode = $LASTEXITCODE

Write-Host "`n╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Test Complete                           ║" -ForegroundColor Cyan
Write-Host "╠══════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  Duration: $($duration.ToString('mm\:ss')) minutes              ║" -ForegroundColor Cyan
Write-Host "║  Exit Code: $exitCode                           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝`n" -ForegroundColor Cyan

exit $exitCode
