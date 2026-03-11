# Check pagination structure across all endpoints

$API_BASE = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$PHONE = "+1234567890"

$otpResp = Invoke-RestMethod -Uri "$API_BASE/auth/request-otp" -Method POST -Body (@{phoneNumber=$PHONE} | ConvertTo-Json) -ContentType "application/json"
$authResp = Invoke-RestMethod -Uri "$API_BASE/auth/verify-otp" -Method POST -Body (@{phoneNumber=$PHONE; otp=$otpResp.devOtp} | ConvertTo-Json) -ContentType "application/json"
$headers = @{ "Authorization" = "Bearer $($authResp.accessToken)" }

Write-Host "=== PAGINATION STRUCTURE CHECK ===" -ForegroundColor Yellow

Write-Host "`n>> USERS Endpoint:" -ForegroundColor Cyan
$users = Invoke-RestMethod -Uri "$API_BASE/users?page=0&size=10" -Headers $headers
if ($users.content) {
    Write-Host "  Has .content property - CORRECT" -ForegroundColor Green
    Write-Host "  Total Elements: $($users.totalElements)" -ForegroundColor Green
} else {
    Write-Host "  NO .content property - FLAT ARRAY (WRONG!)" -ForegroundColor Red
    Write-Host "  Is Array: $($users -is [Array])" -ForegroundColor Yellow
    Write-Host "  Count: $($users.Count)" -ForegroundColor Yellow
}

Write-Host "`n>> ORGANIZATIONS Endpoint:" -ForegroundColor Cyan
$orgs = Invoke-RestMethod -Uri "$API_BASE/organizations?page=0&size=10" -Headers $headers
if ($orgs.content) {
    Write-Host "  Has .content property - CORRECT" -ForegroundColor Green
    Write-Host "  Total Elements: $($orgs.totalElements)" -ForegroundColor Green
} else {
    Write-Host "  NO .content property - FLAT ARRAY (WRONG!)" -ForegroundColor Red
    Write-Host "  Is Array: $($orgs -is [Array])" -ForegroundColor Yellow
    Write-Host "  Count: $($orgs.Count)" -ForegroundColor Yellow
}

Write-Host "`n>> ADDRESSES Endpoint:" -ForegroundColor Cyan
$addresses = Invoke-RestMethod -Uri "$API_BASE/addresses?page=0&size=10" -Headers $headers
if ($addresses.content) {
    Write-Host "  Has .content property - CORRECT" -ForegroundColor Green
    Write-Host "  Total Elements: $($addresses.totalElements)" -ForegroundColor Green
} else {
    Write-Host "  NO .content property - FLAT ARRAY (WRONG!)" -ForegroundColor Red
    Write-Host "  Is Array: $($addresses -is [Array])" -ForegroundColor Yellow
    Write-Host "  Count: $($addresses.Count)" -ForegroundColor Yellow
}

Write-Host "`n>> KYC DOCUMENTS Endpoint:" -ForegroundColor Cyan
$docs = Invoke-RestMethod -Uri "$API_BASE/kyc-documents?page=0&size=10" -Headers $headers
if ($docs.content) {
    Write-Host "  Has .content property - CORRECT" -ForegroundColor Green
    Write-Host "  Total Elements: $($docs.totalElements)" -ForegroundColor Green
} else {
    Write-Host "  NO .content property - FLAT ARRAY (WRONG!)" -ForegroundColor Red
    Write-Host "  Is Array: $($docs -is [Array])" -ForegroundColor Yellow
    Write-Host "  Count: $($docs.Count)" -ForegroundColor Yellow
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Yellow
Write-Host "Backend must return paginated responses in this format:" -ForegroundColor White
Write-Host '{' -ForegroundColor Gray
Write-Host '  "content": [array of items],' -ForegroundColor Gray
Write-Host '  "totalElements": 10,' -ForegroundColor Gray
Write-Host '  "totalPages": 1,' -ForegroundColor Gray
Write-Host '  "size": 10,' -ForegroundColor Gray
Write-Host '  "number": 0' -ForegroundColor Gray
Write-Host '}' -ForegroundColor Gray
