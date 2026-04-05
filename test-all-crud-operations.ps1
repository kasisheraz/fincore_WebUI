$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comprehensive CRUD Operations Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$phone = "+1234567890"

# Step 1: Authenticate
Write-Host "Step 1: Authenticating..." -ForegroundColor Yellow
try {
    $otpReq = @{phoneNumber=$phone} | ConvertTo-Json
    $otpResp = Invoke-RestMethod -Uri "$baseUrl/auth/request-otp" -Method Post -Body $otpReq -ContentType "application/json"
    $otp = $otpResp.devOtp
    
    $verifyReq = @{phoneNumber=$phone; otp=$otp} | ConvertTo-Json
    $authResp = Invoke-RestMethod -Uri "$baseUrl/auth/verify-otp" -Method Post -Body $verifyReq -ContentType "application/json"
    $token = $authResp.accessToken
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Write-Host "  Authenticated successfully as $($authResp.user.firstName) $($authResp.user.lastName)" -ForegroundColor Green
    Write-Host "  Role: $($authResp.user.role)" -ForegroundColor White
} catch {
    Write-Host "  Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$testResults = @{
    Passed = 0
    Failed = 0
    Total = 0
}

function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$TestBlock
    )
    
    $testResults.Total++
    Write-Host ""
    Write-Host "Testing: $Name" -ForegroundColor Cyan
    try {
        & $TestBlock
        Write-Host "  PASSED" -ForegroundColor Green
        $testResults.Passed++
        return $true
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $testResults.Failed++
        return $false
    }
}

# Step 2: Test Organizations CRUD
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Organizations CRUD Operations" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Test-Endpoint "Organizations - List (GET)" {
    $orgs = Invoke-RestMethod -Uri "$baseUrl/organizations?page=0&size=10" -Method Get -Headers $headers
    Write-Host "    Found $($orgs.content.Count) organizations"
    if ($orgs.content.Count -eq 0) { throw "No organizations found" }
}

Test-Endpoint "Organizations - Search" {
    $search = Invoke-RestMethod -Uri "$baseUrl/organizations?page=0&size=10&search=Test" -Method Get -Headers $headers
    Write-Host "    Search returned $($search.content.Count) results"
}

$orgId = $null
Test-Endpoint "Organizations - Create (POST)" {
    $newOrg = @{
        name = "Test Org $(Get-Date -Format 'HHmmss')"
        type = "FINANCIAL_INSTITUTION"
        taxId = "TAX$(Get-Random -Minimum 100000 -Maximum 999999)"
        registrationType = "REGISTERED"
        registrationNumber = "REG$(Get-Random -Minimum 100000 -Maximum 999999)"
        address = "123 Test St"
        city = "Test City"
        state = "TS"
        country = "US"
        postalCode = "12345"
        email = "test@example.com"
        phoneNumber = "1234567890"
        website = "https://test.com"
        industry = "FINTECH"
    } | ConvertTo-Json
    
    $created = Invoke-RestMethod -Uri "$baseUrl/organizations" -Method Post -Body $newOrg -Headers $headers
    $script:orgId = $created.id
    Write-Host "    Created organization ID: $script:orgId"
}

if ($orgId) {
    Test-Endpoint "Organizations - Get by ID (GET)" {
        $org = Invoke-RestMethod -Uri "$baseUrl/organizations/$orgId" -Method Get -Headers $headers
        Write-Host "    Retrieved organization: $($org.name)"
    }
    
    Test-Endpoint "Organizations - Update (PUT)" {
        $updateOrg = @{
            name = "Updated Test Org"
            type = "FINANCIAL_INSTITUTION"
            taxId = "TAX999999"
            registrationType = "REGISTERED"
            registrationNumber = "REG999999"
            address = "456 Update St"
            city = "Update City"
            state = "UP"
            country = "US"
            postalCode = "54321"
            email = "updated@example.com"
            phoneNumber = "9876543210"
            website = "https://updated.com"
            industry = "FINTECH"
        } | ConvertTo-Json
        
        $updated = Invoke-RestMethod -Uri "$baseUrl/organizations/$orgId" -Method Put -Body $updateOrg -Headers $headers
        Write-Host "    Updated organization name: $($updated.name)"
    }
    
    Test-Endpoint "Organizations - Delete (DELETE)" {
        Invoke-RestMethod -Uri "$baseUrl/organizations/$orgId" -Method Delete -Headers $headers | Out-Null
        Write-Host "    Deleted organization ID: $orgId"
    }
}

# Step 3: Test Users CRUD
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Users CRUD Operations" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Test-Endpoint "Users - List (GET)" {
    $users = Invoke-RestMethod -Uri "$baseUrl/users?page=0&size=10" -Method Get -Headers $headers
    Write-Host "    Found $($users.content.Count) users"
    if ($users.content.Count -eq 0) { throw "No users found" }
}

Test-Endpoint "Users - Search" {
    $search = Invoke-RestMethod -Uri "$baseUrl/users?page=0&size=10&search=Test" -Method Get -Headers $headers
    Write-Host "    Search returned $($search.content.Count) results"
}

$userId = $null
Test-Endpoint "Users - Create (POST)" {
    $randomNum = Get-Random -Minimum 100000 -Maximum 999999
    $newUser = @{
        firstName = "Test"
        lastName = "User"
        email = "testuser$randomNum@example.com"
        phoneNumber = "555$randomNum"
        dateOfBirth = "1990-01-01"
        gender = "MALE"
        nationality = "US"
        address = "123 Test St"
        city = "Test City"
        state = "TS"
        country = "US"
        postalCode = "12345"
        role = "CUSTOMER"
        status = "ACTIVE"
    } | ConvertTo-Json
    
    $created = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $newUser -Headers $headers
    $script:userId = $created.id
    Write-Host "    Created user ID: $script:userId"
}

if ($userId) {
    Test-Endpoint "Users - Get by ID (GET)" {
        $user = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Get -Headers $headers
        Write-Host "    Retrieved user: $($user.firstName) $($user.lastName)"
    }
    
    Test-Endpoint "Users - Update (PUT)" {
        $updateUser = @{
            firstName = "Updated"
            lastName = "User"
            email = "updated@example.com"
            phoneNumber = "5559999999"
            dateOfBirth = "1990-01-01"
            gender = "MALE"
            nationality = "US"
            address = "456 Update St"
            city = "Update City"
            state = "UP"
            country = "US"
            postalCode = "54321"
            role = "CUSTOMER"
            status = "ACTIVE"
        } | ConvertTo-Json
        
        $updated = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Put -Body $updateUser -Headers $headers
        Write-Host "    Updated user: $($updated.firstName) $($updated.lastName)"
    }
    
    Test-Endpoint "Users - Delete (DELETE)" {
        Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method Delete -Headers $headers | Out-Null
        Write-Host "    Deleted user ID: $userId"
    }
}

# Step 4: Test KYC Documents
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "KYC Documents Operations" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Test-Endpoint "KYC Documents - List (GET)" {
    $docs = Invoke-RestMethod -Uri "$baseUrl/kyc/documents?page=0&size=10" -Method Get -Headers $headers
    Write-Host "    Found $($docs.content.Count) KYC documents"
}

Test-Endpoint "KYC Documents - Search" {
    $search = Invoke-RestMethod -Uri "$baseUrl/kyc/documents?page=0&size=10&search=Test" -Method Get -Headers $headers
    Write-Host "    Search returned $($search.content.Count) results"
}

# Step 5: Test KYC Verifications
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "KYC Verifications Operations" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Test-Endpoint "KYC Verifications - List (GET)" {
    $verifs = Invoke-RestMethod -Uri "$baseUrl/kyc/verifications?page=0&size=10" -Method Get -Headers $headers
    Write-Host "    Found $($verifs.content.Count) KYC verifications"
}

# Step 6: Test Questionnaires
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Questionnaires Operations" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Test-Endpoint "Questionnaires - List (GET)" {
    $quests = Invoke-RestMethod -Uri "$baseUrl/questionnaires?page=0&size=10" -Method Get -Headers $headers
    Write-Host "    Found $($quests.content.Count) questionnaires"
}

Test-Endpoint "Questionnaires - Search" {
    $search = Invoke-RestMethod -Uri "$baseUrl/questionnaires?page=0&size=10&search=Test" -Method Get -Headers $headers
    Write-Host "    Search returned $($search.content.Count) results"
}

# Step 7: Test Customer Answers
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Customer Answers Operations" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

Test-Endpoint "Customer Answers - List (GET)" {
    $answers = Invoke-RestMethod -Uri "$baseUrl/customer-answers?page=0&size=10" -Method Get -Headers $headers
    Write-Host "    Found $($answers.content.Count) customer answers"
}

# Final Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testResults.Total)" -ForegroundColor White
Write-Host "Passed: $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed: $($testResults.Failed)" -ForegroundColor $(if ($testResults.Failed -eq 0) { "Green" } else { "Red" })
Write-Host ""
$percentage = [math]::Round(($testResults.Passed / $testResults.Total) * 100, 2)
Write-Host "Success Rate: $percentage%" -ForegroundColor $(if ($percentage -ge 90) { "Green" } elseif ($percentage -ge 70) { "Yellow" } else { "Red" })
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All CRUD Operations Tested!" -ForegroundColor Green
Write-Host "UI is running on http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend API: $baseUrl" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
