# Comprehensive CRUD Testing Script for FinCore WebUI
# Tests all CRUD operations for every entity

$API_BASE = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$PHONE = "+1234567890"

# Color output functions
function Write-Success { param($msg) Write-Host "[PASS] $msg" -ForegroundColor Green }
function Write-Failure { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Section { param($msg) Write-Host "`n========== $msg ==========" -ForegroundColor Yellow }

$script:passCount = 0
$script:failCount = 0
$script:token = $null
$script:userId = $null
$script:orgId = $null
$script:addressId = $null
$script:questionnaireId = $null
$script:questionId = $null
$script:kycDocId = $null
$script:kycVerificationId = $null
$script:customerAnswerId = $null

function Invoke-ApiTest {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{},
        [bool]$ExpectSuccess = $true
    )
    
    try {
        $uri = "$API_BASE$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        if ($ExpectSuccess) {
            $script:passCount++
            Write-Success "$Name"
            return $response
        } else {
            $script:failCount++
            Write-Failure "$Name (Expected to fail but succeeded)"
            return $null
        }
    }
    catch {
        if (-not $ExpectSuccess) {
            $script:passCount++
            Write-Success "$Name (Expected failure)"
            return $null
        }
        
        $script:failCount++
        $errorMsg = $_.Exception.Message
        if ($_.ErrorDetails) {
            $errorMsg = $_.ErrorDetails.Message
        }
        Write-Failure "$Name - $errorMsg"
        return $null
    }
}

# ===============================================
# AUTHENTICATION
# ===============================================
Write-Section "AUTHENTICATION"

Write-Info "Requesting OTP for $PHONE..."
$otpResponse = Invoke-ApiTest -Name "Request OTP" -Method POST -Endpoint "/auth/request-otp" -Body @{ phoneNumber = $PHONE }

if ($otpResponse -and $otpResponse.devOtp) {
    $otp = $otpResponse.devOtp
    Write-Info "OTP received: $otp"
    
    $authResponse = Invoke-ApiTest -Name "Verify OTP" -Method POST -Endpoint "/auth/verify-otp" -Body @{ phoneNumber = $PHONE; otp = $otp }
    
    if ($authResponse -and $authResponse.accessToken) {
        $script:token = $authResponse.accessToken
        $authHeaders = @{ "Authorization" = "Bearer $script:token" }
        Write-Success "Authentication successful - Token: $($script:token.Substring(0, 20))..."
        Write-Info "User Role: $($authResponse.user.role)"
    } else {
        Write-Failure "No access token in auth response"
        exit 1
    }
} else {
    Write-Failure "Failed to get OTP"
    exit 1
}

# ===============================================
# USERS - Full CRUD
# ===============================================
Write-Section "USERS - CRUD Operations"

# GET All Users
$users = Invoke-ApiTest -Name "GET All Users" -Endpoint "/users?page=0&size=10&sortBy=id&sortDirection=desc" -Headers $authHeaders
if ($users) {
    Write-Info "Found $($users.totalElements) users"
}

# CREATE User
$newUser = @{
    firstName = "Test"
    middleName = "CRUD"
    lastName = "User$(Get-Random -Min 1000 -Max 9999)"
    email = "testcrud$(Get-Random)@example.com"
    phoneNumber = "+1555$(Get-Random -Min 1000000 -Max 9999999)"
    dateOfBirth = "1990-01-01"
    gender = "MALE"
    role = "CUSTOMER"
    statusDescription = "ACTIVE"
}
$createdUser = Invoke-ApiTest -Name "CREATE User" -Method POST -Endpoint "/users" -Body $newUser -Headers $authHeaders
if ($createdUser -and $createdUser.id) {
    $script:userId = $createdUser.id
    Write-Info "Created User ID: $script:userId"
}

# GET User by ID
if ($script:userId) {
    $user = Invoke-ApiTest -Name "GET User by ID" -Endpoint "/users/$script:userId" -Headers $authHeaders
}

# UPDATE User
if ($script:userId) {
    $updateUser = @{
        firstName = "Updated"
        middleName = "Test"
        lastName = "User"
        email = $newUser.email
        phoneNumber = $newUser.phoneNumber
        dateOfBirth = "1990-01-01"
        gender = "MALE"
        statusDescription = "ACTIVE"
    }
    $updatedUser = Invoke-ApiTest -Name "UPDATE User" -Method PUT -Endpoint "/users/$script:userId" -Body $updateUser -Headers $authHeaders
}

# DELETE User
if ($script:userId) {
    $deleted = Invoke-ApiTest -Name "DELETE User" -Method DELETE -Endpoint "/users/$script:userId" -Headers $authHeaders
}

# ===============================================
# ORGANIZATIONS - Full CRUD
# ===============================================
Write-Section "ORGANIZATIONS - CRUD Operations"

# GET All Organizations
$orgs = Invoke-ApiTest -Name "GET All Organizations" -Endpoint "/organizations?page=0&size=10&sortBy=id&sortDirection=desc" -Headers $authHeaders
if ($orgs) {
    Write-Info "Found $($orgs.totalElements) organizations"
}

# CREATE Organization
$newOrg = @{
    legalName = "Test Org CRUD $(Get-Random -Min 1000 -Max 9999)"
    organisationType = "CORPORATION"
    ownerId = $authResponse.user.id
    registrationNumber = "REG$(Get-Random -Min 100000 -Max 999999)"
    taxId = "TAX$(Get-Random -Min 100000 -Max 999999)"
    statusDescription = "ACTIVE"
}
$createdOrg = Invoke-ApiTest -Name "CREATE Organization" -Method POST -Endpoint "/organizations" -Body $newOrg -Headers $authHeaders
if ($createdOrg -and $createdOrg.id) {
    $script:orgId = $createdOrg.id
    Write-Info "Created Organization ID: $script:orgId"
}

# GET Organization by ID
if ($script:orgId) {
    $org = Invoke-ApiTest -Name "GET Organization by ID" -Endpoint "/organizations/$script:orgId" -Headers $authHeaders
}

# UPDATE Organization
if ($script:orgId) {
    $updateOrg = @{
        legalName = "Updated Test Org"
        organisationType = "CORPORATION"
        ownerId = $authResponse.user.id
        registrationNumber = $newOrg.registrationNumber
        taxId = $newOrg.taxId
        statusDescription = "ACTIVE"
    }
    $updatedOrg = Invoke-ApiTest -Name "UPDATE Organization" -Method PUT -Endpoint "/organizations/$script:orgId" -Body $updateOrg -Headers $authHeaders
}

# DELETE Organization
if ($script:orgId) {
    $deleted = Invoke-ApiTest -Name "DELETE Organization" -Method DELETE -Endpoint "/organizations/$script:orgId" -Headers $authHeaders
}

# ===============================================
# ADDRESSES - Full CRUD
# ===============================================
Write-Section "ADDRESSES - CRUD Operations"

# GET All Addresses
$addresses = Invoke-ApiTest -Name "GET All Addresses" -Endpoint "/addresses?page=0&size=10" -Headers $authHeaders
if ($addresses) {
    Write-Info "Found $($addresses.totalElements) addresses"
}

# CREATE Address
$newAddress = @{
    userId = $authResponse.user.id
    addressType = "HOME"
    streetAddress1 = "123 Test Street"
    streetAddress2 = "Apt 4B"
    city = "Test City"
    stateProvince = "Test State"
    postalCode = "12345"
    country = "USA"
    isPrimary = $true
}
$createdAddress = Invoke-ApiTest -Name "CREATE Address" -Method POST -Endpoint "/addresses" -Body $newAddress -Headers $authHeaders
if ($createdAddress -and $createdAddress.id) {
    $script:addressId = $createdAddress.id
    Write-Info "Created Address ID: $script:addressId"
}

# GET Address by ID
if ($script:addressId) {
    $address = Invoke-ApiTest -Name "GET Address by ID" -Endpoint "/addresses/$script:addressId" -Headers $authHeaders
}

# UPDATE Address
if ($script:addressId) {
    $updateAddress = @{
        userId = $authResponse.user.id
        addressType = "HOME"
        streetAddress1 = "456 Updated Street"
        city = "Updated City"
        stateProvince = "Test State"
        postalCode = "12345"
        country = "USA"
        isPrimary = $true
    }
    $updated = Invoke-ApiTest -Name "UPDATE Address" -Method PUT -Endpoint "/addresses/$script:addressId" -Body $updateAddress -Headers $authHeaders
}

# DELETE Address
if ($script:addressId) {
    $deleted = Invoke-ApiTest -Name "DELETE Address" -Method DELETE -Endpoint "/addresses/$script:addressId" -Headers $authHeaders
}

# ===============================================
# QUESTIONNAIRES - Full CRUD
# ===============================================
Write-Section "QUESTIONNAIRES - CRUD Operations"

# GET All Questionnaires
$questionnaires = Invoke-ApiTest -Name "GET All Questionnaires" -Endpoint "/questionnaires?page=0&size=10" -Headers $authHeaders
if ($questionnaires) {
    Write-Info "Found $($questionnaires.totalElements) questionnaires"
}

# CREATE Questionnaire
$newQuestionnaire = @{
    name = "Test Questionnaire $(Get-Random -Min 1000 -Max 9999)"
    description = "Test questionnaire for CRUD testing"
    version = "1.0"
    isActive = $true
}
$createdQuestionnaire = Invoke-ApiTest -Name "CREATE Questionnaire" -Method POST -Endpoint "/questionnaires" -Body $newQuestionnaire -Headers $authHeaders
if ($createdQuestionnaire -and $createdQuestionnaire.id) {
    $script:questionnaireId = $createdQuestionnaire.id
    Write-Info "Created Questionnaire ID: $script:questionnaireId"
}

# GET Questionnaire by ID
if ($script:questionnaireId) {
    $questionnaire = Invoke-ApiTest -Name "GET Questionnaire by ID" -Endpoint "/questionnaires/$script:questionnaireId" -Headers $authHeaders
}

# UPDATE Questionnaire
if ($script:questionnaireId) {
    $updateQuestionnaire = @{
        name = "Updated Questionnaire"
        description = "Updated description"
        version = "1.1"
        isActive = $true
    }
    $updated = Invoke-ApiTest -Name "UPDATE Questionnaire" -Method PUT -Endpoint "/questionnaires/$script:questionnaireId" -Body $updateQuestionnaire -Headers $authHeaders
}

# DELETE Questionnaire
if ($script:questionnaireId) {
    $deleted = Invoke-ApiTest -Name "DELETE Questionnaire" -Method DELETE -Endpoint "/questionnaires/$script:questionnaireId" -Headers $authHeaders
}

# ===============================================
# QUESTIONS - Full CRUD
# ===============================================
Write-Section "QUESTIONS - CRUD Operations"

# GET All Questions
$questions = Invoke-ApiTest -Name "GET All Questions" -Endpoint "/questions?page=0&size=10" -Headers $authHeaders
if ($questions) {
    Write-Info "Found $($questions.totalElements) questions"
}

# CREATE Question (need a questionnaire first)
if ($questionnaires -and $questionnaires.content -and $questionnaires.content.Count -gt 0) {
    $existingQuestionnaireId = $questionnaires.content[0].id
    $newQuestion = @{
        questionnaireId = $existingQuestionnaireId
        questionText = "Test Question $(Get-Random -Min 1000 -Max 9999)?"
        questionType = "TEXT"
        isRequired = $true
        orderIndex = 1
        isActive = $true
    }
    $createdQuestion = Invoke-ApiTest -Name "CREATE Question" -Method POST -Endpoint "/questions" -Body $newQuestion -Headers $authHeaders
    if ($createdQuestion -and $createdQuestion.id) {
        $script:questionId = $createdQuestion.id
        Write-Info "Created Question ID: $script:questionId"
    }
}

# GET Question by ID
if ($script:questionId) {
    $question = Invoke-ApiTest -Name "GET Question by ID" -Endpoint "/questions/$script:questionId" -Headers $authHeaders
}

# UPDATE Question
if ($script:questionId) {
    $updateQuestion = @{
        questionnaireId = $existingQuestionnaireId
        questionText = "Updated Test Question?"
        questionType = "TEXT"
        isRequired = $true
        orderIndex = 1
        isActive = $true
    }
    $updated = Invoke-ApiTest -Name "UPDATE Question" -Method PUT -Endpoint "/questions/$script:questionId" -Body $updateQuestion -Headers $authHeaders
}

# DELETE Question
if ($script:questionId) {
    $deleted = Invoke-ApiTest -Name "DELETE Question" -Method DELETE -Endpoint "/questions/$script:questionId" -Headers $authHeaders
}

# ===============================================
# KYC DOCUMENTS - Full CRUD
# ===============================================
Write-Section "KYC DOCUMENTS - CRUD Operations"

# GET All KYC Documents
$kycDocs = Invoke-ApiTest -Name "GET All KYC Documents" -Endpoint "/kyc-documents?page=0&size=10" -Headers $authHeaders
if ($kycDocs) {
    Write-Info "Found $($kycDocs.totalElements) KYC documents"
}

# CREATE KYC Document
$newKycDoc = @{
    userId = $authResponse.user.id
    documentType = "PASSPORT"
    documentNumber = "DOC$(Get-Random -Min 100000 -Max 999999)"
    issuingCountry = "USA"
    issueDate = "2020-01-01"
    expiryDate = "2030-01-01"
    verificationStatus = "PENDING"
}
$createdKycDoc = Invoke-ApiTest -Name "CREATE KYC Document" -Method POST -Endpoint "/kyc-documents" -Body $newKycDoc -Headers $authHeaders
if ($createdKycDoc -and $createdKycDoc.id) {
    $script:kycDocId = $createdKycDoc.id
    Write-Info "Created KYC Document ID: $script:kycDocId"
}

# GET KYC Document by ID
if ($script:kycDocId) {
    $kycDoc = Invoke-ApiTest -Name "GET KYC Document by ID" -Endpoint "/kyc-documents/$script:kycDocId" -Headers $authHeaders
}

# UPDATE KYC Document
if ($script:kycDocId) {
    $updateKycDoc = @{
        userId = $authResponse.user.id
        documentType = "PASSPORT"
        documentNumber = $newKycDoc.documentNumber
        issuingCountry = "USA"
        issueDate = "2020-01-01"
        expiryDate = "2030-01-01"
        verificationStatus = "VERIFIED"
    }
    $updated = Invoke-ApiTest -Name "UPDATE KYC Document" -Method PUT -Endpoint "/kyc-documents/$script:kycDocId" -Body $updateKycDoc -Headers $authHeaders
}

# DELETE KYC Document
if ($script:kycDocId) {
    $deleted = Invoke-ApiTest -Name "DELETE KYC Document" -Method DELETE -Endpoint "/kyc-documents/$script:kycDocId" -Headers $authHeaders
}

# ===============================================
# KYC VERIFICATIONS - Full CRUD
# ===============================================
Write-Section "KYC VERIFICATIONS - CRUD Operations"

# GET All KYC Verifications
$kycVerifications = Invoke-ApiTest -Name "GET All KYC Verifications" -Endpoint "/kyc-verifications?page=0&size=10" -Headers $authHeaders
if ($kycVerifications) {
    Write-Info "Found $($kycVerifications.totalElements) KYC verifications"
}

# CREATE KYC Verification
$newKycVerification = @{
    userId = $authResponse.user.id
    verificationType = "IDENTITY"
    verificationStatus = "PENDING"
    verificationMethod = "MANUAL"
    verificationDate = (Get-Date -Format "yyyy-MM-dd")
}
$createdKycVerification = Invoke-ApiTest -Name "CREATE KYC Verification" -Method POST -Endpoint "/kyc-verifications" -Body $newKycVerification -Headers $authHeaders
if ($createdKycVerification -and $createdKycVerification.id) {
    $script:kycVerificationId = $createdKycVerification.id
    Write-Info "Created KYC Verification ID: $script:kycVerificationId"
}

# GET KYC Verification by ID
if ($script:kycVerificationId) {
    $kycVerification = Invoke-ApiTest -Name "GET KYC Verification by ID" -Endpoint "/kyc-verifications/$script:kycVerificationId" -Headers $authHeaders
}

# UPDATE KYC Verification
if ($script:kycVerificationId) {
    $updateKycVerification = @{
        userId = $authResponse.user.id
        verificationType = "IDENTITY"
        verificationStatus = "APPROVED"
        verificationMethod = "MANUAL"
        verificationDate = (Get-Date -Format "yyyy-MM-dd")
    }
    $updated = Invoke-ApiTest -Name "UPDATE KYC Verification" -Method PUT -Endpoint "/kyc-verifications/$script:kycVerificationId" -Body $updateKycVerification -Headers $authHeaders
}

# DELETE KYC Verification
if ($script:kycVerificationId) {
    $deleted = Invoke-ApiTest -Name "DELETE KYC Verification" -Method DELETE -Endpoint "/kyc-verifications/$script:kycVerificationId" -Headers $authHeaders
}

# ===============================================
# CUSTOMER ANSWERS - Full CRUD
# ===============================================
Write-Section "CUSTOMER ANSWERS - CRUD Operations"

# GET All Customer Answers
$customerAnswers = Invoke-ApiTest -Name "GET All Customer Answers" -Endpoint "/customer-answers?page=0&size=10" -Headers $authHeaders
if ($customerAnswers) {
    Write-Info "Found $($customerAnswers.totalElements) customer answers"
}

# CREATE Customer Answer (requires existing question)
if ($questions -and $questions.content -and $questions.content.Count -gt 0) {
    $existingQuestionId = $questions.content[0].id
    $newAnswer = @{
        userId = $authResponse.user.id
        questionId = $existingQuestionId
        answerText = "Test Answer $(Get-Random -Min 1000 -Max 9999)"
        submittedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
    }
    $createdAnswer = Invoke-ApiTest -Name "CREATE Customer Answer" -Method POST -Endpoint "/customer-answers" -Body $newAnswer -Headers $authHeaders
    if ($createdAnswer -and $createdAnswer.id) {
        $script:customerAnswerId = $createdAnswer.id
        Write-Info "Created Customer Answer ID: $script:customerAnswerId"
    }
}

# GET Customer Answer by ID
if ($script:customerAnswerId) {
    $customerAnswer = Invoke-ApiTest -Name "GET Customer Answer by ID" -Endpoint "/customer-answers/$script:customerAnswerId" -Headers $authHeaders
}

# UPDATE Customer Answer
if ($script:customerAnswerId) {
    $updateAnswer = @{
        userId = $authResponse.user.id
        questionId = $existingQuestionId
        answerText = "Updated Test Answer"
        submittedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
    }
    $updated = Invoke-ApiTest -Name "UPDATE Customer Answer" -Method PUT -Endpoint "/customer-answers/$script:customerAnswerId" -Body $updateAnswer -Headers $authHeaders
}

# DELETE Customer Answer
if ($script:customerAnswerId) {
    $deleted = Invoke-ApiTest -Name "DELETE Customer Answer" -Method DELETE -Endpoint "/customer-answers/$script:customerAnswerId" -Headers $authHeaders
}

# ===============================================
# SUMMARY
# ===============================================
Write-Section "TEST SUMMARY"

$total = $script:passCount + $script:failCount
$successRate = [math]::Round(($script:passCount / $total) * 100, 2)

Write-Host "`nTotal Tests: $total" -ForegroundColor White
Write-Host "Passed: $script:passCount" -ForegroundColor Green
Write-Host "Failed: $script:failCount" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 50) { "Yellow" } else { "Red" })

if ($script:failCount -gt 0) {
    Write-Host "`n[!] Some tests failed. Review the output above for details." -ForegroundColor Yellow
} else {
    Write-Host "`n[SUCCESS] All tests passed!" -ForegroundColor Green
}
