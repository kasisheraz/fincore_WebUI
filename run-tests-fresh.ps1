# Fresh test run script
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting fresh test run at: $timestamp" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Run tests
npx playwright test

$exitCode = $LASTEXITCODE
$endTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "`n========================================" -ForegroundColor Cyan  
Write-Host "Test run completed at: $endTime" -ForegroundColor Cyan
Write-Host "Exit code: $exitCode" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

exit $exitCode
