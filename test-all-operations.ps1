# Comprehensive FinCore CRUD Operations Test
# Tests ALL backend endpoints to identify what works and what doesn't

$baseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$phone = "+1234567890"

$results = @{
    Passed = @()
    Failed = @()
}

function Test-Operation {
    param($Name, $ScriptBlock)
    Write-Host "`n[$Name]" -ForegroundColor Cyan
    try {
        & $ScriptBlock
        Write-Host "  ✓ PASS" -ForegroundColor Green
        $results.Passed += $Name
    } catch {
        Write-Host "  ✗ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $results.Failed += "$Name - $($_.Exception.Message)"
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE CRUD OPERATIONS TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ----- AUTHENTICATION -----
Write-Host "`n=== AUTHENTICATION ===" -ForegroundColor Yellow

Test-Operation "Request OTP" {
    $otpReq = @{phoneNumber=$phone} | ConvertTo-Json
    $script:otpResp = Invoke-RestMethod -Uri "$baseUrl/auth/request-otp" -Method Post -Body $otpReq -ContentType "application/json"
    if (-not $otpResp.devOtp) { throw "No OTP in response" }
}

Test-Operation "Verify OTP and Get Token" {
    $verifyReq = @{phoneNumber=$phone; otp=$otpResp.devOtp} | ConvertTo-Json
    $script:authResp = Invoke-RestMethod -Uri "$baseUrl/auth/verify-otp" -Method Post -Body $verifyReq -ContentType "application/json"
    $script:token = $authResp.accessToken
    if (-not $token) { throw "No access token received" }
    $script:headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    $script:userId = $authResp.user.id
}

# ----- USERS -----
Write-Host "`n=== USERS ===" -ForegroundColor Yellow

Test-Operation "GET All Users" {
    $users = Invoke-RestMethod -Uri "$baseUrl/users?page=0``&size=10" -Headers $headers
    if ($users.content.Count -eq 0) { throw "No users found" }
}

Test-Operation "CREATE User" {
    $rand = Get-Random -Minimum 1000 -Maximum 9999
    $newUser = @{
        firstName = "Test"
        lastName = "User$rand"
        email = "test$rand@test.com"
        phoneNumber = "555$rand"
        dateOfBirth = "1990-01-01"
        gender = "MALE"
    } | ConvertTo-Json
    $script:createdUser = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $newUser -Headers $headers
    $script:createdUserId = $createdUser.id
}

Test-Operation "GET User by ID" {
    $user = Invoke-RestMethod -Uri "$baseUrl/users/$createdUserId" -Headers $headers
    if ($user.id -ne $createdUserId) { throw "Wrong user returned" }
}

Test-Operation "UPDATE User" {
    $updateUser = @{
        firstName = "Updated"
        lastName = "Name"
        email = $createdUser.email
        phoneNumber = $createdUser.phoneNumber
        dateOfBirth = "1990-01-01"
        gender = "FEMALE"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/users/$createdUserId" -Method Put -Body $updateUser -Headers $headers | Out-Null
}

Test-Operation "DELETE User" {
    Invoke-RestMethod -Uri "$baseUrl/users/$createdUserId" -Method Delete -Headers $headers | Out-Null
}

# ----- ORGANIZATIONS -----
Write-Host "`n=== ORGANIZATIONS ===" -ForegroundColor Yellow

Test-Operation "GET All Organizations" {
    $orgs = Invoke-RestMethod -Uri "$baseUrl/organizations?page=0``&size=10" -Headers $headers
    Write-Host "    Found: $($orgs.content.Count) organizations"
}

Test-Operation "CREATE Organization" {
    $rand = Get-Random -Minimum 1000 -Maximum 9999
    $newOrg = @{
        legalName = "Test Org $rand"
        organisationType = "PRIVATE"
        registrationNumber = "REG$rand"
        email = "org$rand@test.com"
        phoneNumber = "555100$rand"
        ownerId = $userId
    } | ConvertTo-Json
    $script:createdOrg = Invoke-RestMethod -Uri "$baseUrl/organizations" -Method Post -Body $newOrg -Headers $headers
    $script:createdOrgId = $createdOrg.id
}

Test-Operation "GET Organization by ID" {
    $org = Invoke-RestMethod -Uri "$baseUrl/organizations/$createdOrgId" -Headers $headers
    if ($org.id -ne $createdOrgId) { throw "Wrong organization returned" }
}

Test-Operation "UPDATE Organization" {
    $updateOrg = @{
        legalName = "Updated Org Name"
        organisationType = "PRIVATE"
        registrationNumber = $createdOrg.registrationNumber
        email = $createdOrg.email
        phoneNumber = $createdOrg.phoneNumber
        ownerId = $userId
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/organizations/$createdOrgId" -Method Put -Body $updateOrg -Headers $headers | Out-Null
}

Test-Operation "DELETE Organization" {
    Invoke-RestMethod -Uri "$baseUrl/organizations/$createdOrgId" -Method Delete -Headers $headers | Out-Null
}

# ----- ADDRESSES -----
Write-Host "`n=== ADDRESSES ===" -ForegroundColor Yellow

Test-Operation "GET All Addresses" {
    $addresses = Invoke-RestMethod -Uri "$baseUrl/addresses?page=0``&size=10" -Headers $headers
    Write-Host "    Found: $($addresses.content.Count) addresses"
}

# ----- QUESTIONNAIRES -----
Write-Host "`n=== QUESTIONNAIRES ===" -ForegroundColor Yellow

Test-Operation "GET All Questionnaires" {
    $questionnaires = Invoke-RestMethod -Uri "$baseUrl/questionnaires?page=0``&size=10" -Headers $headers
    Write-Host "    Found: $($questionnaires.content.Count) questionnaires"
}

# ----- QUESTIONS -----
Write-Host "`n=== QUESTIONS ===" -ForegroundColor Yellow

Test-Operation "GET All Questions" {
    $questions = Invoke-RestMethod -Uri "$baseUrl/questions?page=0``&size=10" -Headers $headers
    Write-Host "    Found: $($questions.content.Count) questions"
}

# ----- KYC DOCUMENTS -----
Write-Host "`n=== KYC DOCUMENTS ===" -ForegroundColor Yellow

Test-Operation "GET All KYC Documents" {
    $docs = Invoke-RestMethod -Uri "$baseUrl/kyc-documents?page=0``&size=10" -Headers $headers
    Write-Host "    Found: $($docs.content.Count) documents"
}

# ----- KYC VERIFICATIONS -----
Write-Host "`n=== KYC VERIFICATIONS ===" -ForegroundColor Yellow

Test-Operation "GET All KYC Verifications" {
    $verifications = Invoke-RestMethod -Uri "$baseUrl/kyc-verifications?page=0``&size=10" -Headers $headers
    Write-Host "    Found: $($verifications.content.Count) verifications"
}

# ----- CUSTOMER ANSWERS -----
Write-Host "`n=== CUSTOMER ANSWERS ===" -ForegroundColor Yellow

Test-Operation "GET All Customer Answers" {
    $answers = Invoke-RestMethod -Uri "$baseUrl/customer-answers?page=0``&size=10" -Headers $headers
    Write-Host "    Found: $($answers.content.Count) answers"
}

# ----- SEARCH ENDPOINTS (May not be implemented) -----
Write-Host "`n=== SEARCH ENDPOINTS (Testing) ===" -ForegroundColor Yellow

Test-Operation "User Search" {
    Invoke-RestMethod -Uri "$baseUrl/users/search?page=0``&size=10" -Headers $headers | Out-Null
}

Test-Operation "Organization Search" {
    Invoke-RestMethod -Uri "$baseUrl/organizations/search?page=0``&size=10" -Headers $headers | Out-Null
}

Test-Operation "KYC Documents Search" {
    Invoke-RestMethod -Uri "$baseUrl/kyc-documents/search?page=0``&size=10" -Headers $headers | Out-Null
}

Test-Operation "KYC Verifications Search" {
    Invoke-RestMethod -Uri "$baseUrl/kyc-verifications/search?page=0``&size=10" -Headers $headers | Out-Null
}

Test-Operation "Questions Search" {
    Invoke-RestMethod -Uri "$baseUrl/questions/search?page=0``&size=10" -Headers $headers | Out-Null
}

Test-Operation "Customer Answers Search" {
    Invoke-RestMethod -Uri "$baseUrl/customer-answers/search?page=0``&size=10" -Headers $headers | Out-Null
}

# ----- SUMMARY -----
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nPASSED: $($results.Passed.Count)" -ForegroundColor Green
$results.Passed | ForEach-Object { Write-Host "  ✓ $_" -ForegroundColor Green }

Write-Host "`nFAILED: $($results.Failed.Count)" -ForegroundColor Red
$results.Failed | ForEach-Object { Write-Host "  ✗ $_" -ForegroundColor Red }

$totalTests = $results.Passed.Count + $results.Failed.Count
$successRate = [math]::Round(($results.Passed.Count / $totalTests) * 100, 1)
Write-Host "`nSuccess Rate: $successRate% ($($results.Passed.Count)/$totalTests)" -ForegroundColor $(if($successRate -ge 80){'Green'}elseif($successRate -ge 60){'Yellow'}else{'Red'})

if ($results.Failed.Count -gt 0) {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "  RECOMMENDATIONS" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "`n1. Search endpoints returning 500 errors - backend may not have implemented them"
    Write-Host "2. Frontend should fallback to regular GET endpoints"
    Write-Host "3. Contact backend team about missing /search endpoints"
}
