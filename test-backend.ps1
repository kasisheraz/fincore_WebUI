# FinCore Backend API Testing Script
# Tests whether the backend API is accessible and working

$ErrorActionPreference = "Continue"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "FinCore Backend API Testing" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$API_BASE = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"

Write-Host "`nBase URL: $API_BASE" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   Success: API is responding" -ForegroundColor Green
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Request OTP
Write-Host "`n2. Testing Authentication (Request OTP)..." -ForegroundColor Yellow
$phoneNumber = "+1234567890"
try {
    $otpResponse = Invoke-RestMethod -Uri "$API_BASE/auth/request-otp" `
        -Method POST `
        -Body (ConvertTo-Json @{ phoneNumber = $phoneNumber }) `
        -ContentType "application/json" `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "   Success: OTP = $($otpResponse.devOtp)" -ForegroundColor Green
    $otp = $otpResponse.devOtp
    
    # Test 3: Verify OTP
    Write-Host "`n3. Testing Verify OTP..." -ForegroundColor Yellow
    $authResponse = Invoke-RestMethod -Uri "$API_BASE/auth/verify-otp" `
        -Method POST `
        -Body (ConvertTo-Json @{ phoneNumber = $phoneNumber; otp = $otp }) `
        -ContentType "application/json" `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "   Success: Got access token" -ForegroundColor Green
    $token = $authResponse.accessToken
    $authHeader = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
    
    # Test 4: Get Users
    Write-Host "`n4. Testing Get Users..." -ForegroundColor Yellow
    $users = Invoke-RestMethod -Uri "$API_BASE/users" `
        -Method GET `
        -Headers $authHeader `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "   Success: Found $($users.Count) users" -ForegroundColor Green
    if ($users.Count -gt 0) {
        Write-Host "   First user: $($users[0].fullName)" -ForegroundColor Gray
    }
    
    # Test 5: Get Organizations
    Write-Host "`n5. Testing Get Organizations..." -ForegroundColor Yellow
    $orgs = Invoke-RestMethod -Uri "$API_BASE/organizations" `
        -Method GET `
        -Headers $authHeader `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "   Success: Found $($orgs.Count) organizations" -ForegroundColor Green
    if ($orgs.Count -gt 0) {
        Write-Host "   First org: $($orgs[0].name)" -ForegroundColor Gray
    }
    
    # Test 6: Create Test User
    Write-Host "`n6. Creating Test User..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "HHmmss"
    $newUserData = @{
        fullName = "Test User $timestamp"
        email = "testuser${timestamp}@example.com"
        phoneNumber = "+19876540$(Get-Random -Minimum 100 -Maximum 999)"
        role = "VIEWER"
    }
    
    $newUser = Invoke-RestMethod -Uri "$API_BASE/users" `
        -Method POST `
        -Headers $authHeader `
        -Body (ConvertTo-Json $newUserData) `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "   Success: Created user: $($newUser.fullName)" -ForegroundColor Green
    
    # Test 7: Create Test Organization
    Write-Host "`n7. Creating Test Organization..." -ForegroundColor Yellow
    $newOrgData = @{
        name = "Test Corp $timestamp"
        type = "CORPORATE"
        registrationNumber = "REG$(Get-Random -Minimum 100000 -Maximum 999999)"
        taxId = "TAX$(Get-Random -Minimum 100000 -Maximum 999999)"
        industry = "Technology"
        status = "ACTIVE"
    }
    
    $newOrg = Invoke-RestMethod -Uri "$API_BASE/organizations" `
        -Method POST `
        -Headers $authHeader `
        -Body (ConvertTo-Json $newOrgData) `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "   Success: Created organization: $($newOrg.name)" -ForegroundColor Green
    
    # Summary
    Write-Host "`n=====================================" -ForegroundColor Cyan
    Write-Host "All Tests Passed!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "`nYour UI should now work with test data:" -ForegroundColor Yellow
    Write-Host "https://fincore-webui-npe-lfd6ooarra-nw.a.run.app" -ForegroundColor Cyan
    Write-Host "`nLogin with phone: $phoneNumber" -ForegroundColor Gray
    Write-Host "OTP will be shown in console during login" -ForegroundColor Gray
    
} catch {
    Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    }
}

Write-Host ""
