# Test Organization Create
$baseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$phone = "+1234567890"

Write-Host "Authenticating..." -ForegroundColor Cyan
$otpReq = @{phoneNumber=$phone} | ConvertTo-Json
$otpResp = Invoke-RestMethod -Uri "$baseUrl/auth/request-otp" -Method Post -Body $otpReq -ContentType "application/json"
$otp = $otpResp.devOtp
Write-Host "OTP: $otp" -ForegroundColor Green

$verifyReq = @{phoneNumber=$phone; otp=$otp} | ConvertTo-Json
$authResp = Invoke-RestMethod -Uri "$baseUrl/auth/verify-otp" -Method Post -Body $verifyReq -ContentType "application/json"
$token = $authResp.accessToken

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`nTesting Organization CREATE..." -ForegroundColor Cyan

$rand = Get-Random -Minimum 1000 -Maximum 9999
$newOrg = @{
    name = "Test Org $rand"
    type = "CORPORATION"
    registrationNumber = "REG$rand"
    email = "org$rand@test.com"
    phoneNumber = "555100$rand"
    status = "ACTIVE"
} | ConvertTo-Json

Write-Host "Sending:" -ForegroundColor Gray
Write-Host $newOrg -ForegroundColor Gray

try {
    $result = Invoke-RestMethod -Uri "$baseUrl/organizations" -Method Post -Body $newOrg -Headers $headers
    Write-Host "`nSUCCESS!" -ForegroundColor Green
    $result | ConvertTo-Json
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "`nFAILED - Status: $statusCode" -ForegroundColor Red
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    Write-Host "`nFull exception:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}
