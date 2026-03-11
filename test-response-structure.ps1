# Check exact response structure

$API_BASE = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$PHONE = "+1234567890"

$otpResp = Invoke-RestMethod -Uri "$API_BASE/auth/request-otp" -Method POST -Body (@{phoneNumber=$PHONE} | ConvertTo-Json) -ContentType "application/json"
$authResp = Invoke-RestMethod -Uri "$API_BASE/auth/verify-otp" -Method POST -Body (@{phoneNumber=$PHONE; otp=$otpResp.devOtp} | ConvertTo-Json) -ContentType "application/json"
$headers = @{ "Authorization" = "Bearer $($authResp.accessToken)" }

Write-Host "=== RAW API RESPONSE STRUCTURE ===" -ForegroundColor Yellow

$users = Invoke-RestMethod -Uri "$API_BASE/users?page=0&size=10&sortBy=id&sortDirection=desc" -Headers $headers

Write-Host "`nFull Users Response:" -ForegroundColor Cyan
$users | ConvertTo-Json -Depth 3

Write-Host "`n`nResponse Properties:" -ForegroundColor Cyan
$users | Get-Member -MemberType Properties | Format-Table Name, MemberType

Write-Host "`nFirst User Details:" -ForegroundColor Cyan
if ($users.content -and $users.content.Count -gt 0) {
    $users.content[0] | ConvertTo-Json -Depth 2
    Write-Host "`nFirst User Properties:" -ForegroundColor White
    $users.content[0] | Get-Member -MemberType Properties | Format-Table Name
}
