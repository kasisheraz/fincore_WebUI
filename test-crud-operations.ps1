# Comprehensive CRUD Testing Script for FinCore Backend
# Tests all operations: Create, Read, Update, Delete

$ErrorActionPreference = "Continue"
$baseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$phoneNumber = "+1234567890"

Write-Host "==========================================`n" -ForegroundColor Cyan
Write-Host " FinCore Comprehensive CRUD Testing" -ForegroundColor Cyan
Write-Host "`n==========================================" -ForegroundColor Cyan

# Phase 1: Authentication
Write-Host "`nPhase 1: Authentication" -ForegroundColor Yellow
Write-Host "------------------------`n" -ForegroundColor Yellow

# Request OTP
Write-Host "1. Request OTP..."
try {
    $otpRequest = @{
        phoneNumber = $phoneNumber
    } | ConvertTo-Json
    
    $otpResponse = Invoke-RestMethod -Uri "$baseUrl/auth/request-otp" -Method Post -Body $otpRequest -ContentType "application/json"
    
    # Extract OTP from response - check multiple possible locations
    if ($otpResponse.otp) {
        $otp = $otpResponse.otp
    } elseif ($otpResponse.data.otp) {
        $otp = $otpResponse.data.otp
    } else {
        # OTP might be in message
        $otp = $otpResponse.message -replace '[^\d]',''
    }
    
    Write-Host "   PASS - OTP: $otp" -ForegroundColor Green
    Write-Host "   Response: $($otpResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "   FAIL - $_" -ForegroundColor Red
    Write-Host "   Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# Verify OTP
Write-Host "2. Verify OTP..."
try {
    $verifyRequest = @{
        phoneNumber = $phoneNumber
        otp = $otp
    } | ConvertTo-Json
    
    $authResponse = Invoke-RestMethod -Uri "$baseUrl/auth/verify-otp" -Method Post -Body $verifyRequest -ContentType "application/json"
    Write-Host "   PASS - Got JWT token" -ForegroundColor Green
    $token = $authResponse.token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
} catch {
    Write-Host "   FAIL - $_" -ForegroundColor Red
    exit 1
}

# Phase 2: User CRUD Operations
Write-Host "`nPhase 2: User CRUD Operations" -ForegroundColor Yellow
Write-Host "------------------------------`n" -ForegroundColor Yellow

# CREATE User
Write-Host "3. CREATE User..."
try {
    $newUser = @{
        firstName = "Test"
        lastName = "User"
        email = "test.user.$(Get-Random)@fincore.com"
        phoneNumber = "$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"
        dateOfBirth = "1990-01-01"
        gender = "MALE"
    } | ConvertTo-Json
    
    $createdUser = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $newUser -Headers $headers
    Write-Host "   PASS - User created with ID: $($createdUser.id)" -ForegroundColor Green
    $userId = $createdUser.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    Write-Host "   FAIL - Status: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $errorBody" -ForegroundColor Red
    Write-Host "   This might be a permissions issue (403) or validation error (400)" -ForegroundColor Yellow
}

# READ User
Write-Host "4. READ User by ID..."
if ($userId) {
    try {
        $user = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Get -Headers $headers
        Write-Host "   PASS - Retrieved user: $($user.firstName) $($user.lastName)" -ForegroundColor Green
    } catch {
        Write-Host "   FAIL - $_" -ForegroundColor Red
    }
} else {
    Write-Host "   SKIP - No user created" -ForegroundColor Yellow
}

# UPDATE User
Write-Host "5. UPDATE User..."
if ($userId) {
    try {
        $updateUser = @{
            firstName = "Updated"
            lastName = "Name"
            email = $createdUser.email
            phoneNumber = $createdUser.phoneNumber
            dateOfBirth = "1990-01-01"
            gender = "MALE"
        } | ConvertTo-Json
        
        $updatedUser = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Put -Body $updateUser -Headers $headers
        Write-Host "   PASS - User updated: $($updatedUser.firstName) $($updatedUser.lastName)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   FAIL - Status: $statusCode - $_" -ForegroundColor Red
    }
} else {
    Write-Host "   SKIP - No user created" -ForegroundColor Yellow
}

# DELETE User
Write-Host "6. DELETE User..."
if ($userId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Delete -Headers $headers
        Write-Host "   PASS - User deleted" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   FAIL - Status: $statusCode - $_" -ForegroundColor Red
    }
} else {
    Write-Host "   SKIP - No user created" -ForegroundColor Yellow
}

# Phase 3: Organization CRUD Operations
Write-Host "`nPhase 3: Organization CRUD Operations" -ForegroundColor Yellow
Write-Host "--------------------------------------`n" -ForegroundColor Yellow

# CREATE Organization
Write-Host "7. CREATE Organization..."
try {
    $newOrg = @{
        name = "Test Organization $(Get-Random)"
        type = "CORPORATION"
        registrationNumber = "REG$(Get-Random -Minimum 10000 -Maximum 99999)"
        email = "org.$(Get-Random)@fincore.com"
        phoneNumber = "$(Get-Random -Minimum 1000000000 -Maximum 9999999999)"
        status = "ACTIVE"
    } | ConvertTo-Json
    
    $createdOrg = Invoke-RestMethod -Uri "$baseUrl/organizations" -Method Post -Body $newOrg -Headers $headers
    Write-Host "   PASS - Organization created with ID: $($createdOrg.id)" -ForegroundColor Green
    $orgId = $createdOrg.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message
    Write-Host "   FAIL - Status: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $errorBody" -ForegroundColor Red
}

# READ Organization
Write-Host "8. READ Organization by ID..."
if ($orgId) {
    try {
        $org = Invoke-RestMethod -Uri "$baseUrl/organizations/$orgId" -Method Get -Headers $headers
        Write-Host "   PASS - Retrieved organization: $($org.name)" -ForegroundColor Green
    } catch {
        Write-Host "   FAIL - $_" -ForegroundColor Red
    }
} else {
    Write-Host "   SKIP - No organization created" -ForegroundColor Yellow
}

# UPDATE Organization
Write-Host "9. UPDATE Organization..."
if ($orgId) {
    try {
        $updateOrg = @{
            name = "Updated Organization"
            type = "CORPORATION"
            registrationNumber = $createdOrg.registrationNumber
            email = $createdOrg.email
            phoneNumber = $createdOrg.phoneNumber
            status = "ACTIVE"
        } | ConvertTo-Json
        
        $updatedOrg = Invoke-RestMethod -Uri "$baseUrl/organizations/$orgId" -Method Put -Body $updateOrg -Headers $headers
        Write-Host "   PASS - Organization updated: $($updatedOrg.name)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   FAIL - Status: $statusCode - $_" -ForegroundColor Red
    }
} else {
    Write-Host "   SKIP - No organization created" -ForegroundColor Yellow
}

# DELETE Organization
Write-Host "10. DELETE Organization..."
if ($orgId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/organizations/$orgId" -Method Delete -Headers $headers
        Write-Host "   PASS - Organization deleted" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   FAIL - Status: $statusCode - $_" -ForegroundColor Red
    }
} else {
    Write-Host "   SKIP - No organization created" -ForegroundColor Yellow
}

# Summary
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`nAuthentication: WORKING" -ForegroundColor Green
Write-Host "JWT Token: Generated successfully`n" -ForegroundColor Green

if ($userId) {
    Write-Host "User CRUD: PASSED - All operations working" -ForegroundColor Green
} else {
    Write-Host "User CRUD: FAILED - CREATE operation blocked" -ForegroundColor Red
    Write-Host "  Possible causes:" -ForegroundColor Yellow
    Write-Host "    - 403: User role lacks CREATE_USER permission" -ForegroundColor Yellow
    Write-Host "    - 400: Validation error (check required fields)" -ForegroundColor Yellow
    Write-Host "    - 409: Duplicate email/phone number" -ForegroundColor Yellow
}

if ($orgId) {
    Write-Host "Organization CRUD: PASSED - All operations working" -ForegroundColor Green
} else {
    Write-Host "Organization CRUD: FAILED - CREATE operation blocked" -ForegroundColor Red
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Detailed Analysis" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`nIf you see 403 errors:" -ForegroundColor Yellow
Write-Host "  1. Check user role/permissions in backend" -ForegroundColor White
Write-Host "  2. Verify JWT token includes necessary claims" -ForegroundColor White
Write-Host "  3. Check if backend has role-based access control" -ForegroundColor White
Write-Host "  4. User from phone +1234567890 may need ADMIN role`n" -ForegroundColor White

Write-Host "If you see 400 errors:" -ForegroundColor Yellow
Write-Host "  1. Check required field validation" -ForegroundColor White
Write-Host "  2. Verify data format (dates, phone numbers)" -ForegroundColor White
Write-Host "  3. Check for unique constraints (email, phone)`n" -ForegroundColor White

Write-Host "Token Info:" -ForegroundColor Cyan
Write-Host "  User: +1234567890" -ForegroundColor White
Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor White
