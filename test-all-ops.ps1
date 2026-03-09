# Comprehensive FinCore CRUD Operations Test
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
        $ScriptBlock.Invoke()
        Write-Host "  PASS" -ForegroundColor Green
        $script:results.Passed += $Name
    } catch {
        Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $script:results.Failed += "$Name - $($_.Exception.Message)"
    }
}

Write-Host "`n========================================"  -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE CRUD OPERATIONS TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ----- AUTHENTICATION -----
Write-Host "`n=== AUTHENTICATION ===" -ForegroundColor Yellow

Test-Operation "Request OTP" {
    $otpReq = @{phoneNumber=$phone} | ConvertTo-Json
    $script:otpResp = Invoke-RestMethod -Uri ($baseUrl + "/auth/request-otp") -Method Post -Body $otpReq -ContentType "application/json"
    if (-not $otpResp.devOtp) { throw "No OTP in response" }
}

Test-Operation "Verify OTP and Get Token" {
    $verifyReq = @{phoneNumber=$phone; otp=$otpResp.devOtp} | ConvertTo-Json
    $script:authResp = Invoke-RestMethod -Uri ($baseUrl + "/auth/verify-otp") -Method Post -Body $verifyReq -ContentType "application/json"
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
    $uri = $baseUrl + "/users?page=0&size=10"
    $users = Invoke-RestMethod -Uri $uri -Headers $headers
    Write-Host "    Found: $($users.content.Count) users" -ForegroundColor Gray
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
    $uri = $baseUrl + "/users"
    $script:createdUser = Invoke-RestMethod -Uri $uri -Method Post -Body $newUser -Headers $headers
    $script:createdUserId = $createdUser.id
    Write-Host "    Created User ID: $createdUserId" -ForegroundColor Gray
}

Test-Operation "GET User by ID" {
    $uri = $baseUrl + "/users/$createdUserId"
    $user = Invoke-RestMethod -Uri $uri -Headers $headers
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
    $uri = $baseUrl + "/users/$createdUserId"
    Invoke-RestMethod -Uri $uri -Method Put -Body $updateUser -Headers $headers | Out-Null
}

Test-Operation "DELETE User" {
    $uri = $baseUrl + "/users/$createdUserId"
    Invoke-RestMethod -Uri $uri -Method Delete -Headers $headers | Out-Null
}

# ----- ORGANIZATIONS -----
Write-Host "`n=== ORGANIZATIONS ===" -ForegroundColor Yellow

Test-Operation "GET All Organizations" {
    $uri = $baseUrl + "/organizations?page=0&size=10"
    $orgs = Invoke-RestMethod -Uri $uri -Headers $headers
    Write-Host "    Found: $($orgs.content.Count) organizations" -ForegroundColor Gray
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
    $uri = $baseUrl + "/organizations"
    $script:createdOrg = Invoke-RestMethod -Uri $uri -Method Post -Body $newOrg -Headers $headers
    $script:createdOrgId = $createdOrg.id
    Write-Host "    Created Org ID: $createdOrgId" -ForegroundColor Gray
}

Test-Operation "GET Organization by ID" {
    $uri = $baseUrl + "/organizations/$createdOrgId"
    $org = Invoke-RestMethod -Uri $uri -Headers $headers
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
   $uri = $baseUrl + "/organizations/$createdOrgId"
    Invoke-RestMethod -Uri $uri -Method Put -Body $updateOrg -Headers $headers | Out-Null
}

Test-Operation "DELETE Organization" {
    $uri = $baseUrl + "/organizations/$createdOrgId"
    Invoke-RestMethod -Uri $uri -Method Delete -Headers $headers | Out-Null
}

# ----- OTHER ENTITIES (GET ONLY) -----
Write-Host "`n=== OTHER ENTITIES ===" -ForegroundColor Yellow

Test-Operation "GET All Addresses" {
    $uri = $baseUrl + "/addresses?page=0&size=10"
    $addresses = Invoke-RestMethod -Uri $uri -Headers $headers
    Write-Host "    Found: $($addresses.content.Count) addresses" -ForegroundColor Gray
}

Test-Operation "GET All Questionnaires" {
    $uri = $baseUrl + "/questionnaires?page=0&size=10"
    $questionnaires = Invoke-RestMethod -Uri $uri -Headers $headers
    Write-Host "    Found: $($questionnaires.content.Count) questionnaires" -ForegroundColor Gray
}

Test-Operation "GET All Questions" {
    $uri = $baseUrl + "/questions?page=0&size=10"
    $questions = Invoke-RestMethod -Uri $uri -Headers $headers
    Write-Host "    Found: $($questions.content.Count) questions" -ForegroundColor Gray
}

Test-Operation "GET All KYC Documents" {
    $uri = $baseUrl + "/kyc-documents?page=0&size=10"
    $docs = Invoke-RestMethod -Uri $uri -Headers $headers
    Write-Host "    Found: $($docs.content.Count) documents" -ForegroundColor Gray
}

Test-Operation "GET All KYC Verifications" {
    $uri = $baseUrl + "/kyc-verifications?page=0&size=10"
    $verifications = Invoke-RestMethod -Uri $uri -Headers $headers
    Write-Host "    Found: $($verifications.content.Count) verifications" -ForegroundColor Gray
}

Test-Operation "GET All Customer Answers" {
    $uri = $baseUrl + "/customer-answers?page=0&size=10"
    $answers = Invoke-RestMethod -Uri $uri -Headers $headers
    Write-Host "    Found: $($answers.content.Count) answers" -ForegroundColor Gray
}

# ----- SEARCH ENDPOINTS (May not be implemented) -----
Write-Host "`n=== SEARCH ENDPOINTS ===" -ForegroundColor Yellow

Test-Operation "User Search" {
    $uri = $baseUrl + "/users/search?page=0&size=10"
    Invoke-RestMethod -Uri $uri -Headers $headers | Out-Null
}

Test-Operation "Organization Search" {
    $uri = $baseUrl + "/organizations/search?page=0&size=10"
    Invoke-RestMethod -Uri $uri -Headers $headers | Out-Null
}

Test-Operation "KYC Documents Search" {
    $uri = $baseUrl + "/kyc-documents/search?page=0&size=10"
    Invoke-RestMethod -Uri $uri -Headers $headers | Out-Null
}

Test-Operation "KYC Verifications Search" {
    $uri = $baseUrl + "/kyc-verifications/search?page=0&size=10"
    Invoke-RestMethod -Uri $uri -Headers $headers | Out-Null
}

Test-Operation "Questions Search" {
    $uri = $baseUrl + "/questions/search?page=0&size=10"
    Invoke-RestMethod -Uri $uri -Headers $headers | Out-Null
}

Test-Operation "Customer Answers Search" {
    $uri = $baseUrl + "/customer-answers/search?page=0&size=10"
    Invoke-RestMethod -Uri $uri -Headers $headers | Out-Null
}

# ----- SUMMARY -----
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nPASSED: $($results.Passed.Count)" -ForegroundColor Green
$results.Passed | ForEach-Object { Write-Host "  + $_" -ForegroundColor Green }

if ($results.Failed.Count -gt 0) {
    Write-Host "`nFAILED: $($results.Failed.Count)" -ForegroundColor Red
    $results.Failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

$totalTests = $results.Passed.Count + $results.Failed.Count
if ($totalTests -gt 0) {
    $successRate = [math]::Round(($results.Passed.Count / $totalTests) * 100, 1)
    Write-Host "`nSuccess Rate: $successRate% ($($results.Passed.Count)/$totalTests)" -ForegroundColor $(if($successRate -ge 80){'Green'}elseif($successRate -ge 60){'Yellow'}else{'Red'})
}

if ($results.Failed.Count -gt 0) {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "  RECOMMENDATIONS" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "`n1. /search endpoints returning errors - backend may not have implemented them"
    Write-Host "2. Frontend should fallback to regular GET endpoints without /search"
    Write-Host "3. For deadlock errors on OTP - just retry, it's a backend DB locking issue"
}
