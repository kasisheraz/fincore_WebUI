# Check JWT Token Claims
$baseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$phone = "+1234567890"

Write-Host "Getting JWT token for: $phone" -ForegroundColor Cyan

# Authenticate
$otpReq = @{phoneNumber=$phone} | ConvertTo-Json
Write-Host "Requesting OTP..." -ForegroundColor Gray
$otpResp = Invoke-RestMethod -Uri "$baseUrl/auth/request-otp" -Method Post -Body $otpReq -ContentType "application/json"
$otp = $otpResp.devOtp
Write-Host "OTP received: $otp" -ForegroundColor Green

$verifyReq = @{phoneNumber=$phone; otp=$otp} | ConvertTo-Json
Write-Host "Verifying OTP..." -ForegroundColor Gray
$authResp = Invoke-RestMethod -Uri "$baseUrl/auth/verify-otp" -Method Post -Body $verifyReq -ContentType "application/json"
Write-Host "Auth response contains accessToken" -ForegroundColor Gray
$token = $authResp.accessToken
Write-Host "Token extracted: $($token.Substring(0, 30))..." -ForegroundColor Green
Write-Host "User role: $($authResp.user.role)" -ForegroundColor Cyan

Write-Host "`nJWT Token:" -ForegroundColor Yellow
Write-Host $token

# Decode JWT (Base64)
$parts = $token.Split('.')
if ($parts.Length -eq 3) {
    $payload = $parts[1]
    # Add padding if needed
    while ($payload.Length % 4 -ne 0) { $payload += "=" }
    
    $decodedBytes = [Convert]::FromBase64String($payload)
    $decodedJson = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
    
    Write-Host "`nDecoded JWT Payload:" -ForegroundColor Yellow
    $decodedJson | ConvertFrom-Json | ConvertTo-Json -Depth 10
} else {
    Write-Host "Invalid JWT format" -ForegroundColor Red
}

# Test a simple GET to confirm token works
Write-Host "`nTesting token with GET /users..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
}
try {
    $users = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers $headers
    Write-Host "SUCCESS - Token works for GET operations" -ForegroundColor Green
    Write-Host "Found $($users.content.Count) users" -ForegroundColor White
} catch {
    Write-Host "FAILED - Token doesn't work" -ForegroundColor Red
}

# Test CREATE
Write-Host "`nTesting token with POST /users (CREATE)..." -ForegroundColor Cyan
$rand = Get-Random -Minimum 1000 -Maximum 9999
$newUser = @{
    firstName = "Test"
    lastName = "User$rand"
    email = "test$rand@test.com"
    phoneNumber = "555$rand"
    dateOfBirth = "1990-01-01"
    gender = "MALE"
} | ConvertTo-Json

$headers["Content-Type"] = "application/json"

try {
    $created = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $newUser -Headers $headers
    Write-Host "SUCCESS - User created with ID: $($created.id)" -ForegroundColor Green
    
    # Cleanup
    Invoke-RestMethod -Uri "$baseUrl/users/$($created.id)" -Method Delete -Headers $headers | Out-Null
    Write-Host "Cleaned up test user" -ForegroundColor Gray
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "FAILED - Status: $status" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
}
