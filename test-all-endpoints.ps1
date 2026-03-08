# Comprehensive Backend API Testing Script
# Tests all major endpoints to verify backend functionality

$ErrorActionPreference = "Continue"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "FinCore Comprehensive API Testing" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$API_BASE = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Uri,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "`nTesting: $Name" -ForegroundColor Yellow
    Write-Host "  $Method $Uri" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            TimeoutSec = 15
            ErrorAction = "Stop"
        }
        
        if ($Body -and $Method -ne "GET") {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        $count = if ($response -is [array]) { $response.Count } else { "1 item" }
        Write-Host "  ✓ Success: $count" -ForegroundColor Green
        
        $script:results += [PSCustomObject]@{
            Name = $Name
            Status = "✓ PASS"
            Details = $count
        }
        
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $message = $_.Exception.Message
        Write-Host "  ✗ Failed: $statusCode - $message" -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            Write-Host "    $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
        }
        
        $script:results += [PSCustomObject]@{
            Name = $Name
            Status = "✗ FAIL"
            Details = "$statusCode - $message"
        }
        
        return $null
    }
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Phase 1: Authentication" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$phoneNumber = "+1234567890"

# Test 1: Request OTP
$otpResponse = Test-Endpoint -Name "Request OTP" -Uri "$API_BASE/auth/request-otp" -Method POST -Body @{ phoneNumber = $phoneNumber }

if ($otpResponse -and $otpResponse.devOtp) {
    $otp = $otpResponse.devOtp
    Write-Host "  OTP: $otp" -ForegroundColor Cyan
    
    # Test 2: Verify OTP
    $authResponse = Test-Endpoint -Name "Verify OTP" -Uri "$API_BASE/auth/verify-otp" -Method POST -Body @{ phoneNumber = $phoneNumber; otp = $otp }
    
    if ($authResponse -and $authResponse.accessToken) {
        $token = $authResponse.accessToken
        $authHeaders = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        Write-Host "`n=========================================" -ForegroundColor Cyan
        Write-Host "Phase 2: User Management" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        
        # Test 3: Get Current User
        $currentUser = Test-Endpoint -Name "Get Current User (/auth/me)" -Uri "$API_BASE/auth/me" -Headers $authHeaders
        if ($currentUser) {
            Write-Host "  User: $($currentUser.fullName) - Role: $($currentUser.role)" -ForegroundColor Cyan
        }
        
        # Test 4: List Users
        $users = Test-Endpoint -Name "List All Users" -Uri "$API_BASE/users" -Headers $authHeaders
        if ($users -and $users.Count -gt 0) {
            Write-Host "  Sample users:" -ForegroundColor Cyan
            $users | Select-Object -First 3 | ForEach-Object {
                Write-Host "    - $($_.fullName) ($($_.email))" -ForegroundColor Gray
            }
        }
        
        # Test 5: Get Single User
        if ($users -and $users.Count -gt 0) {
            $userId = $users[0].id
            Test-Endpoint -Name "Get User by ID" -Uri "$API_BASE/users/$userId" -Headers $authHeaders | Out-Null
        }
        
        Write-Host "`n=========================================" -ForegroundColor Cyan
        Write-Host "Phase 3: Organization Management" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        
        # Test 6: List Organizations
        $orgs = Test-Endpoint -Name "List All Organizations" -Uri "$API_BASE/organizations" -Headers $authHeaders
        if ($orgs -and $orgs.Count -gt 0) {
            Write-Host "  Sample organizations:" -ForegroundColor Cyan
            $orgs | Select-Object -First 3 | ForEach-Object {
                Write-Host "    - $($_.name) ($($_.type))" -ForegroundColor Gray
            }
        }
        
        # Test 7: Get Single Organization
        if ($orgs -and $orgs.Count -gt 0) {
            $orgId = $orgs[0].id
            Test-Endpoint -Name "Get Organization by ID" -Uri "$API_BASE/organizations/$orgId" -Headers $authHeaders | Out-Null
        }
        
        Write-Host "`n=========================================" -ForegroundColor Cyan
        Write-Host "Phase 4: Address Management" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        
        # Test 8: List Addresses
        $addresses = Test-Endpoint -Name "List All Addresses" -Uri "$API_BASE/addresses" -Headers $authHeaders
        
        Write-Host "`n=========================================" -ForegroundColor Cyan
        Write-Host "Phase 5: Questionnaire Management" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        
        # Test 9: List Questionnaires
        $questionnaires = Test-Endpoint -Name "List Questionnaires" -Uri "$API_BASE/questionnaires" -Headers $authHeaders
        
        # Test 10: List Questions
        $questions = Test-Endpoint -Name "List Questions" -Uri "$API_BASE/questions" -Headers $authHeaders
        
        Write-Host "`n=========================================" -ForegroundColor Cyan
        Write-Host "Phase 6: KYC Management" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        
        # Test 11: List KYC Documents
        $kycDocs = Test-Endpoint -Name "List KYC Documents" -Uri "$API_BASE/kyc-documents" -Headers $authHeaders
        
        # Test 12: List KYC Verifications
        $kycVerifications = Test-Endpoint -Name "List KYC Verifications" -Uri "$API_BASE/kyc-verifications" -Headers $authHeaders
        
        Write-Host "`n=========================================" -ForegroundColor Cyan
        Write-Host "Phase 7: Customer Answers" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        
        # Test 13: List Customer Answers
        $answers = Test-Endpoint -Name "List Customer Answers" -Uri "$API_BASE/customer-answers" -Headers $authHeaders
        
        Write-Host "`n=========================================" -ForegroundColor Cyan
        Write-Host "Test Summary" -ForegroundColor Cyan
        Write-Host "=========================================" -ForegroundColor Cyan
        
        $script:results | Format-Table -AutoSize
        
        $passed = ($script:results | Where-Object { $_.Status -like "*PASS*" }).Count
        $failed = ($script:results | Where-Object { $_.Status -like "*FAIL*" }).Count
        $total = $script:results.Count
        
        $resultColor = if ($failed -eq 0) { "Green" } else { "Yellow" }
        Write-Host "`nResults: $passed passed, $failed failed out of $total tests" -ForegroundColor $resultColor
        
        if ($failed -eq 0) {
            Write-Host "`n[SUCCESS] All tests passed! Backend is fully operational." -ForegroundColor Green
            Write-Host "`nYour UI should now work perfectly at:" -ForegroundColor Cyan
            Write-Host "https://fincore-webui-npe-lfd6ooarra-nw.a.run.app" -ForegroundColor Cyan
        } else {
            Write-Host "`n[WARNING] Some tests failed. Check the errors above." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
