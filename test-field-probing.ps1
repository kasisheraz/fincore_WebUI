# Probe for more specific field requirements

$API_BASE = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$PHONE = "+1234567890"

# Get auth
$otpResp = Invoke-RestMethod -Uri "$API_BASE/auth/request-otp" -Method POST -Body (@{phoneNumber=$PHONE} | ConvertTo-Json) -ContentType "application/json"
$authResp = Invoke-RestMethod -Uri "$API_BASE/auth/verify-otp" -Method POST -Body (@{phoneNumber=$PHONE; otp=$otpResp.devOtp} | ConvertTo-Json) -ContentType "application/json"
$headers = @{ "Authorization" = "Bearer $($authResp.accessToken)" }

Write-Host "`n=== Getting Existing Data to Understand Structure ===" -ForegroundColor Yellow

# Get existing addresses to see field structure
try {
    $addresses = Invoke-RestMethod -Uri "$API_BASE/addresses?page=0&size=1" -Headers $headers
    if ($addresses.content.Count -gt 0) {
        Write-Host "`n[Sample Address Structure]:" -ForegroundColor Cyan
        $addresses.content[0] | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
    } else {
        Write-Host "[INFO] No existing addresses found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Cannot fetch addresses: $_" -ForegroundColor Red
}

# Get existing questionnaires to see structure
try {
    $questionnaires = Invoke-RestMethod -Uri "$API_BASE/questionnaires?page=0&size=1" -Headers $headers
    if ($questionnaires.content.Count -gt 0) {
        Write-Host "`n[Sample Questionnaire Structure]:" -ForegroundColor Cyan
        $questionnaires.content[0] | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
    } else {
        Write-Host "[INFO] No existing questionnaires found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Cannot fetch questionnaires: $_" -ForegroundColor Red
}

# Get existing KYC verifications to see structure
try {
    $verifications = Invoke-RestMethod -Uri "$API_BASE/kyc-verifications?page=0&size=1" -Headers $headers
    if ($verifications.content.Count -gt 0) {
        Write-Host "`n[Sample KYC Verification Structure]:" -ForegroundColor Cyan
        $verifications.content[0] | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
    } else {
        Write-Host "[INFO] No existing KYC verifications found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Cannot fetch KYC verifications: $_" -ForegroundColor Red
}

Write-Host "`n=== Testing Address with typeCode as Integer ===" -ForegroundColor Yellow

# Address type codes might be: 1=HOME, 2=WORK, 3=BILLING, etc.
$addressTypeCodes = @(1, 2, 3)
foreach ($typeCode in $addressTypeCodes) {
    $testAddress = @{
        userId = $authResp.user.id
        typeCode = $typeCode
        addressLine1 = "123 Test Street"
        city = "Test City"
        stateProvince = "Test State"
        postalCode = "12345"
        country = "USA"
        isPrimary = $true
    }
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE/addresses" -Method POST -Body ($testAddress | ConvertTo-Json) -ContentType "application/json" -Headers $headers
        Write-Host "[SUCCESS] typeCode $typeCode works - Created Address ID: $($result.id)" -ForegroundColor Green
        Invoke-RestMethod -Uri "$API_BASE/addresses/$($result.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
        break
    }
    catch {
        $errorMsg = if ($_.ErrorDetails) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        Write-Host "[FAILED] typeCode $typeCode : $errorMsg" -ForegroundColor Red
    }
}

Write-Host "`n=== Testing KYC Verification with Different Fields ===" -ForegroundColor Yellow

$orgs = Invoke-RestMethod -Uri "$API_BASE/organizations?page=0&size=1" -Headers $headers
$orgId = if ($orgs.content.Count -gt 0) { $orgs.content[0].id } else { $null }

if ($orgId) {
    # Try without verificationDate
    $testVerification = @{
        userId = $authResp.user.id
        organisationId = $orgId
        verificationType = "IDENTITY"
        status = "PENDING"
        verificationMethod = "MANUAL"
    }
    try {
        $result = Invoke-RestMethod -Uri "$API_BASE/kyc-verifications" -Method POST -Body ($testVerification | ConvertTo-Json) -ContentType "application/json" -Headers $headers
        Write-Host "[SUCCESS] KYC Verification created - ID: $($result.id)" -ForegroundColor Green
        Invoke-RestMethod -Uri "$API_BASE/kyc-verifications/$($result.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
    }
    catch {
        $errorMsg = if ($_.ErrorDetails) { $_.ErrorDetails.Message } else { $_.Exception.Message }
        Write-Host "[FAILED] KYC Verification: $errorMsg" -ForegroundColor Red
        
        # Try with different field names
        $testVerification2 = @{
            userId = $authResp.user.id
            organisationId = $orgId
            typeCode = "IDENTITY"
            statusCode = "PENDING"
            methodCode = "MANUAL"
        }
        try {
            $result = Invoke-RestMethod -Uri "$API_BASE/kyc-verifications" -Method POST -Body ($testVerification2 | ConvertTo-Json) -ContentType "application/json" -Headers $headers
            Write-Host "[SUCCESS] KYC Verification with alternate fields - ID: $($result.id)" -ForegroundColor Green
            Invoke-RestMethod -Uri "$API_BASE/kyc-verifications/$($result.id)" -Method DELETE -Headers $headers -ErrorAction SilentlyContinue | Out-Null
        }
        catch {
            $errorMsg2 = if ($_.ErrorDetails) { $_.ErrorDetails.Message } else { $_.Exception.Message }
            Write-Host "[FAILED] Alternate fields: $errorMsg2" -ForegroundColor Red
        }
    }
}
