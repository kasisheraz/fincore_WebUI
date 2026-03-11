# Quick test to probe backend field requirements

$API_BASE = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$PHONE = "+1234567890"

# Get auth token
$otpResp = Invoke-RestMethod -Uri "$API_BASE/auth/request-otp" -Method POST -Body (@{phoneNumber=$PHONE} | ConvertTo-Json) -ContentType "application/json"
$authResp = Invoke-RestMethod -Uri "$API_BASE/auth/verify-otp" -Method POST -Body (@{phoneNumber=$PHONE; otp=$otpResp.devOtp} | ConvertTo-Json) -ContentType "application/json"
$headers = @{ "Authorization" = "Bearer $($authResp.accessToken)" }

Write-Host "`n=== Testing User Roles ===" -ForegroundColor Yellow

# Test different roles
$roles = @("CUSTOMER", "ADMIN", "USER", "SYSTEM_ADMINISTRATOR", "ORGANIZATION_ADMIN")
foreach ($role in $roles) {
    $testUser = @{
        firstName = "Test"
        lastName = "User"
        email = "test$(Get-Random)@example.com"
        phoneNumber = "+1555$(Get-Random -Min 1000000 -Max 9999999)"
        dateOfBirth = "1990-01-01"
        gender = "MALE"
        role = $role
        statusDescription = "ACTIVE"
    }
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE/users" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json" -Headers $headers
        Write-Host "[SUCCESS] Role '$role' accepted - Created User ID: $($result.id)" -ForegroundColor Green
        # Clean up
        Invoke-RestMethod -Uri "$API_BASE/users/$($result.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
        break  # If one works, we're good
    }
    catch {
        Write-Host "[FAILED] Role '$role': $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Testing Address Fields ===" -ForegroundColor Yellow

# Test address with different field names
$testAddress = @{
    userId = $authResp.user.id
    typeCode = "HOME"
    addressLine1 = "123 Test Street"
    addressLine2 = "Apt 4B"
    city = "Test City"
    stateProvince = "Test State"
    postalCode = "12345"
    country = "USA"
    isPrimary = $true
}
try {
    $result = Invoke-RestMethod -Uri "$API_BASE/addresses" -Method POST -Body ($testAddress | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    Write-Host "[SUCCESS] Address created with ID: $($result.id)" -ForegroundColor Green
    Invoke-RestMethod -Uri "$API_BASE/addresses/$($result.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
}
catch {
    Write-Host "[FAILED] Address creation: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testing Questionnaire Fields ===" -ForegroundColor Yellow

# Test questionnaire with different field structures
$testQuestionnaire = @{
    title = "Test Questionnaire"
    description = "Test description"
    version = "1.0"
    status = "ACTIVE"
}
try {
    $result = Invoke-RestMethod -Uri "$API_BASE/questionnaires" -Method POST -Body ($testQuestionnaire | ConvertTo-Json) -ContentType "application/json" -Headers $headers
    Write-Host "[SUCCESS] Questionnaire created with ID: $($result.id)" -ForegroundColor Green
    Invoke-RestMethod -Uri "$API_BASE/questionnaires/$($result.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
}
catch {
    Write-Host "[FAILED] Questionnaire: $($_.ErrorDetails.Message)" -ForegroundColor Red
    
    # Try with 'name' instead of 'title'
    $testQuestionnaire.name = $testQuestionnaire.title
    $testQuestionnaire.Remove('title')
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE/questionnaires" -Method POST -Body ($testQuestionnaire | ConvertTo-Json) -ContentType "application/json" -Headers $headers
        Write-Host "[SUCCESS] Questionnaire created with 'name' field - ID: $($result.id)" -ForegroundColor Green
        Invoke-RestMethod -Uri "$API_BASE/questionnaires/$($result.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
    }
    catch {
        Write-Host "[FAILED] Questionnaire with 'name': $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Testing KYC Document Fields ===" -ForegroundColor Yellow

# Get first organization
$orgs = Invoke-RestMethod -Uri "$API_BASE/organizations?page=0&size=1" -Headers $headers
$orgId = if ($orgs.content.Count -gt 0) { $orgs.content[0].id } else { $null }

if ($orgId) {
    $testKycDoc = @{
        userId = $authResp.user.id
        organisationId = $orgId
        documentType = "PASSPORT"
        documentNumber = "DOC$(Get-Random)"
        issuingCountry = "USA"
        issueDate = "2020-01-01"
        expiryDate = "2030-01-01"
        status = "PENDING"
    }
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE/kyc-documents" -Method POST -Body ($testKycDoc | ConvertTo-Json) -ContentType "application/json" -Headers $headers
        Write-Host "[SUCCESS] KYC Document created with ID: $($result.id)" -ForegroundColor Green
        Invoke-RestMethod -Uri "$API_BASE/kyc-documents/$($result.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
    }
    catch {
        Write-Host "[FAILED] KYC Document: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIPPED] No organizations found to test KYC Document" -ForegroundColor Yellow
}

Write-Host "`n=== Testing KYC Verification Fields ===" -ForegroundColor Yellow

if ($orgId) {
    $testKycVerification = @{
        userId = $authResp.user.id
        organisationId = $orgId
        verificationType = "IDENTITY"
        status = "PENDING"
        verificationMethod = "MANUAL"
        verificationDate = (Get-Date -Format "yyyy-MM-dd")
    }
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE/kyc-verifications" -Method POST -Body ($testKycVerification | ConvertTo-Json) -ContentType "application/json" -Headers $headers
        Write-Host "[SUCCESS] KYC Verification created with ID: $($result.id)" -ForegroundColor Green
        Invoke-RestMethod -Uri "$API_BASE/kyc-verifications/$($result.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
    }
    catch {
        Write-Host "[FAILED] KYC Verification: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIPPED] No organizations found to test KYC Verification" -ForegroundColor Yellow
}
