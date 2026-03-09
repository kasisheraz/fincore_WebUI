# Comprehensive CRUD Testing for FinCore
# Tests CREATE operations that user reported as failing

$baseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$phone = "+1234567890"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " FinCore CRUD Testing" -ForegroundColor Cyan  
Write-Host "==========================================" -ForegroundColor Cyan

# Authenticate
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

# Test User Creation
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Testing USER CREATE (Reported as failing)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

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
    $userId = $createdUser.id
    $userCreateSuccess = $true
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    Write-Host "`n✗ FAILED - Cannot create user" -ForegroundColor Red
    Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    Write-Host "  Error: $errorBody" -ForegroundColor Red
    
    if ($statusCode -eq 403) {
        Write-Host "`n  Diagnosis: 403 Forbidden" -ForegroundColor Yellow
        Write-Host "  Possible causes:" -ForegroundColor Yellow
        Write-Host "    - User lacks CREATE_USER permission" -ForegroundColor Yellow
        Write-Host "    - Backend role-based access control blocking operation" -ForegroundColor Yellow
        Write-Host "    - JWT token missing required role/claim" -ForegroundColor Yellow
    } elseif ($statusCode -eq 400) {
        Write-Host "`n  Diagnosis: 400 Bad Request" -ForegroundColor Yellow
        Write-Host "  Possible causes:" -ForegroundColor Yellow
        Write-Host "    - Missing required field" -ForegroundColor Yellow
        Write-Host "    - Invalid data format" -ForegroundColor Yellow
        Write-Host "    - Validation constraint violated" -ForegroundColor Yellow
    }
    $userCreateSuccess = $false
}

# Test User Update
if ($userCreateSuccess) {
    Write-Host "`n==========================================" -ForegroundColor Cyan
    Write-Host " Testing USER UPDATE" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    
    $updateUser = @{
        firstName = "Updated"
        lastName = "Name"
        email = $createdUser.email
        phoneNumber = $createdUser.phoneNumber
        dateOfBirth = "1990-05-15"
        gender = "FEMALE"
    } | ConvertTo-Json
    
    Write-Host "`nAttempting to UPDATE user ID: $userId..." -ForegroundColor Yellow
    
    try {
        $updatedUser = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Put -Body $updateUser -Headers $headers
        Write-Host "`n✓ SUCCESS - User updated!" -ForegroundColor Green
        Write-Host "  Name: $($updatedUser.firstName) $($updatedUser.lastName)" -ForegroundColor White
        Write-Host "  Gender: $($updatedUser.gender)" -ForegroundColor White
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "`n✗ FAILED - Cannot update user" -ForegroundColor Red
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
        Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    # Test User Delete
    Write-Host "`n==========================================" -ForegroundColor Cyan
    Write-Host " Testing USER DELETE" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    
    Write-Host "`nAttempting to DELETE user ID: $userId..." -ForegroundColor Yellow
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Delete -Headers $headers
        Write-Host "`n✓ SUCCESS - User deleted!" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "`n✗ FAILED - Cannot delete user" -ForegroundColor Red
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
        Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test Organization Creation
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Testing ORGANIZATION CREATE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$randomNum = Get-Random -Minimum 1000 -Maximum 9999
$newOrg = @{
    name = "Test Org CRUD$randomNum"
    type = "CORPORATION"
    registrationNumber = "REG$randomNum"
    email = "org.crud.$randomNum@fincore.com"
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
    $orgId = $createdOrg.id
    $orgCreateSuccess = $true
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "`n✗ FAILED - Cannot create organization" -ForegroundColor Red
    Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    Write-Host "  Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    $orgCreateSuccess = $false
}

# Delete test organization if created
if ($orgCreateSuccess) {
    Write-Host "`nCleaning up - deleting test organization..." -ForegroundColor Gray
    try {
        Invoke-RestMethod -Uri "$baseUrl/organizations/$orgId" -Method Delete -Headers $headers
        Write-Host "  ✓ Test organization deleted" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Could not delete test organization" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`nAuthentication: " -NoNewline
Write-Host "WORKING ✓" -ForegroundColor Green

Write-Host "User CREATE: " -NoNewline
if ($userCreateSuccess) {
    Write-Host "WORKING ✓" -ForegroundColor Green
} else {
    Write-Host "FAILING ✗" -ForegroundColor Red
}

Write-Host "Organization CREATE: " -NoNewline
if ($orgCreateSuccess) {
    Write-Host "WORKING ✓" -ForegroundColor Green
} else {
    Write-Host "FAILING ✗" -ForegroundColor Red
}

if (-not $userCreateSuccess -or -not $orgCreateSuccess) {
    Write-Host "`n==========================================" -ForegroundColor Yellow
    Write-Host " RECOMMENDATIONS" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Yellow
    Write-Host "`n1. Check backend logs for detailed error messages" -ForegroundColor White
    Write-Host "2. Verify user permissions/roles for phone: $phone" -ForegroundColor White
    Write-Host "3. Check if backend requires specific roles for CREATE" -ForegroundColor White
    Write-Host "4. Test with a different user account" -ForegroundColor White
    Write-Host "5. Check backend CORS and security configurations`n" -ForegroundColor White
}
