# Test CREATE operations - User reported 403 errors
$baseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$phone = "+1234567890"

Write-Host "`n==========================================`n  FinCore CREATE Operation Tests`n==========================================" -ForegroundColor Cyan

# Step 1: Authenticate
Write-Host "`n[1/3] Requesting OTP..." -ForegroundColor Yellow
$otpReq = @{phoneNumber=$phone} | ConvertTo-Json
$otpResp = Invoke-RestMethod -Uri "$baseUrl/auth/request-otp" -Method Post -Body $otpReq -ContentType "application/json"
$otp = $otpResp.devOtp
Write-Host "  ✓ OTP: $otp" -ForegroundColor Green

Write-Host "`n[2/3] Verifying OTP..." -ForegroundColor Yellow
$verifyReq = @{phoneNumber=$phone; otp=$otp} | ConvertTo-Json
$authResp = Invoke-RestMethod -Uri "$baseUrl/auth/verify-otp" -Method Post -Body $verifyReq -ContentType "application/json"
$token = $authResp.token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
Write-Host "  ✓ JWT Token obtained" -ForegroundColor Green

# Test 1: Create User
Write-Host "`n==========================================`n  TEST 1: CREATE USER`n==========================================" -ForegroundColor Cyan

$randomNum = Get-Random -Minimum 1000 -Maximum 9999
$newUser = @{
    firstName = "TestUser"
    lastName = "CRUD$randomNum"
    email = "test.crud.$randomNum@fincore.com"
    phoneNumber = "555000$randomNum"
    dateOfBirth = "1990-05-15"
    gender = "MALE"
} | ConvertTo-Json

Write-Host "`nAttempting to CREATE user..." -ForegroundColor Yellow
Write-Host "Data: $newUser" -ForegroundColor Gray

try {
    $createdUser = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $newUser -Headers $headers
    Write-Host "`n✓ SUCCESS - User created!" -ForegroundColor Green
    Write-Host "  ID: $($createdUser.id)" -ForegroundColor White
    Write-Host "  Name: $($createdUser.firstName) $($createdUser.lastName)" -ForegroundColor White
    Write-Host "  Email: $($createdUser.email)" -ForegroundColor White
    $userCreated = $true
    $userId = $createdUser.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    Write-Host "`n✗ FAILED - Cannot create user" -ForegroundColor Red
    Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    Write-Host "  Error: $errorBody" -ForegroundColor Red
    
    if ($statusCode -eq 403) {
        Write-Host "`n  ⚠ DIAGNOSIS: 403 Forbidden" -ForegroundColor Yellow
        Write-Host "    • User lacks CREATE_USER permission" -ForegroundColor Yellow
        Write-Host "    • Backend RBAC blocking operation" -ForegroundColor Yellow
        Write-Host "    • JWT token missing required role" -ForegroundColor Yellow
    }
    $userCreated = $false
}

# Test 2: Create Organization
Write-Host "`n==========================================`n  TEST 2: CREATE ORGANIZATION`n==========================================" -ForegroundColor Cyan

$randomNum = Get-Random -Minimum 1000 -Maximum 9999
$newOrg = @{
    name = "Test Org $randomNum"
    type = "CORPORATION"
    registrationNumber = "REG$randomNum"
    email = "org.$randomNum@fincore.com"
    phoneNumber = "555100$randomNum"
    status = "ACTIVE"
} | ConvertTo-Json

Write-Host "`nAttempting to CREATE organization..." -ForegroundColor Yellow
Write-Host "Data: $newOrg" -ForegroundColor Gray

try {
    $createdOrg = Invoke-RestMethod -Uri "$baseUrl/organizations" -Method Post -Body $newOrg -Headers $headers
    Write-Host "`n✓ SUCCESS - Organization created!" -ForegroundColor Green
    Write-Host "  ID: $($createdOrg.id)" -ForegroundColor White
    Write-Host "  Name: $($createdOrg.name)" -ForegroundColor White
    $orgCreated = $true
    $orgId = $createdOrg.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "`n✗ FAILED - Cannot create organization" -ForegroundColor Red
    Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    
    if ($statusCode -eq 403) {
        Write-Host "`n  ⚠ DIAGNOSIS: 403 Forbidden" -ForegroundColor Yellow
        Write-Host "    • User lacks CREATE_ORGANIZATION permission" -ForegroundColor Yellow
    }
    $orgCreated = $false
}

# Cleanup
if ($userCreated) {
    Write-Host "`nCleaning up - deleting test user..." -ForegroundColor Gray
    try {
        Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Delete -Headers $headers | Out-Null
        Write-Host "  ✓ Deleted test user" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Could not delete test user" -ForegroundColor Yellow
    }
}

if ($orgCreated) {
    Write-Host "Cleaning up - deleting test organization..." -ForegroundColor Gray
    try {
        Invoke-RestMethod -Uri "$baseUrl/organizations/$orgId" -Method Delete -Headers $headers | Out-Null
        Write-Host "  ✓ Deleted test organization" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Could not delete test organization" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n==========================================`n  SUMMARY`n==========================================" -ForegroundColor Cyan

Write-Host "`nAuthentication: WORKING" -ForegroundColor Green

Write-Host "User CREATE: " -NoNewline
if ($userCreated) {
    Write-Host "WORKING" -ForegroundColor Green
} else {
    Write-Host "FAILING" -ForegroundColor Red
}

Write-Host "Organization CREATE: " -NoNewline
if ($orgCreated) {
    Write-Host "WORKING" -ForegroundColor Green
} else {
    Write-Host "FAILING" -ForegroundColor Red
}

if (-not $userCreated -or -not $orgCreated) {
    Write-Host "`n==========================================`n  RECOMMENDATIONS`n==========================================" -ForegroundColor Yellow
    Write-Host "`n1. Check backend logs for detailed errors"
    Write-Host "2. Verify permissions for user: $phone"
    Write-Host "3. Check JWT token claims/roles"
    Write-Host "4. Contact backend team to grant required roles"
}
