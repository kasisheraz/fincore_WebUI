# Comprehensive Backend API Testing
$ErrorActionPreference = "Continue"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " FinCore Comprehensive API Testing" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$API = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$pass = 0
$fail = 0

Write-Host "`nPhase 1: Authentication" -ForegroundColor Yellow
Write-Host "------------------------`n" -ForegroundColor Yellow

# Test 1: Request OTP
Write-Host "1. Request OTP..." -ForegroundColor Gray
try {
    $otp = Invoke-RestMethod -Uri "$API/auth/request-otp" -Method POST -Body (@{phoneNumber="+1234567890"} | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   PASS - OTP: $($otp.devOtp)" -ForegroundColor Green
    $pass++
    
    # Test 2: Verify OTP
    Write-Host "2. Verify OTP..." -ForegroundColor Gray
    $auth = Invoke-RestMethod -Uri "$API/auth/verify-otp" -Method POST -Body (@{phoneNumber="+1234567890";otp=$otp.devOtp} | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   PASS - Got token" -ForegroundColor Green
    $pass++
    
    $headers = @{
        "Authorization" = "Bearer $($auth.accessToken)"
        "Content-Type" = "application/json"
    }
    
    # Test 3: Get Current User
    Write-Host "3. Get Current User..." -ForegroundColor Gray
    $me = Invoke-RestMethod -Uri "$API/auth/me" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   PASS - User: $($me.fullName) ($($me.role))" -ForegroundColor Green
    $pass++
    
    Write-Host "`nPhase 2: User Management" -ForegroundColor Yellow
    Write-Host "------------------------`n" -ForegroundColor Yellow
    
    # Test 4: List Users
    Write-Host "4. List All Users..." -ForegroundColor Gray
    $users = Invoke-RestMethod -Uri "$API/users" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   PASS - Found $($users.Count) users" -ForegroundColor Green
    $pass++
    if ($users.Count -gt 0) {
        Write-Host "   Sample: $($users[0].fullName) - $($users[0].email)" -ForegroundColor Cyan
    }
    
    # Test 5: Get User by ID
    if ($users.Count -gt 0) {
        Write-Host "5. Get User by ID..." -ForegroundColor Gray
        $user = Invoke-RestMethod -Uri "$API/users/$($users[0].id)" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   PASS - Got user: $($user.fullName)" -ForegroundColor Green
        $pass++
    }
    
    Write-Host "`nPhase 3: Organization Management" -ForegroundColor Yellow
    Write-Host "--------------------------------`n" -ForegroundColor Yellow
    
    # Test 6: List Organizations
    Write-Host "6. List All Organizations..." -ForegroundColor Gray
    try {
        $orgs = Invoke-RestMethod -Uri "$API/organizations" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   PASS - Found $($orgs.Count) organizations" -ForegroundColor Green
        $pass++
        if ($orgs.Count -gt 0) {
            Write-Host "   Sample: $($orgs[0].name) - $($orgs[0].type)" -ForegroundColor Cyan
            
            # Test 7: Get Organization by ID
            Write-Host "7. Get Organization by ID..." -ForegroundColor Gray
            $org = Invoke-RestMethod -Uri "$API/organizations/$($orgs[0].id)" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
            Write-Host "   PASS - Got org: $($org.name)" -ForegroundColor Green
            $pass++
        }
    } catch {
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $fail++
    }
    
    Write-Host "`nPhase 4: Address Management" -ForegroundColor Yellow
    Write-Host "---------------------------`n" -ForegroundColor Yellow
    
    # Test 8: List Addresses
    Write-Host "8. List All Addresses..." -ForegroundColor Gray
    try {
        $addrs = Invoke-RestMethod -Uri "$API/addresses" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   PASS - Found $($addrs.Count) addresses" -ForegroundColor Green
        $pass++
    } catch {
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $fail++
    }
    
    Write-Host "`nPhase 5: Questionnaire Management" -ForegroundColor Yellow
    Write-Host "---------------------------------`n" -ForegroundColor Yellow
    
    # Test 9: List Questionnaires
    Write-Host "9. List Questionnaires..." -ForegroundColor Gray
    try {
        $quests = Invoke-RestMethod -Uri "$API/questionnaires" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   PASS - Found $($quests.Count) questionnaires" -ForegroundColor Green
        $pass++
    } catch {
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $fail++
    }
    
    # Test 10: List Questions
    Write-Host "10. List Questions..." -ForegroundColor Gray
    try {
        $questions = Invoke-RestMethod -Uri "$API/questions" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   PASS - Found $($questions.Count) questions" -ForegroundColor Green
        $pass++
    } catch {
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $fail++
    }
    
    Write-Host "`nPhase 6: KYC Management" -ForegroundColor Yellow
    Write-Host "-----------------------`n" -ForegroundColor Yellow
    
    # Test 11: List KYC Documents
    Write-Host "11. List KYC Documents..." -ForegroundColor Gray
    try {
        $docs = Invoke-RestMethod -Uri "$API/kyc-documents" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   PASS - Found $($docs.Count) documents" -ForegroundColor Green
        $pass++
    } catch {
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $fail++
    }
    
    # Test 12: List KYC Verifications
    Write-Host "12. List KYC Verifications..." -ForegroundColor Gray
    try {
        $verifs = Invoke-RestMethod -Uri "$API/kyc-verifications" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   PASS - Found $($verifs.Count) verifications" -ForegroundColor Green
        $pass++
    } catch {
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $fail++
    }
    
    Write-Host "`nPhase 7: Customer Answers" -ForegroundColor Yellow
    Write-Host "-------------------------`n" -ForegroundColor Yellow
    
    # Test 13: List Customer Answers
    Write-Host "13. List Customer Answers..." -ForegroundColor Gray
    try {
        $answers = Invoke-RestMethod -Uri "$API/customer-answers" -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        Write-Host "   PASS - Found $($answers.Count) answers" -ForegroundColor Green
        $pass++
    } catch {
        Write-Host "   FAIL - $($_.Exception.Message)" -ForegroundColor Red
        $fail++
    }
    
} catch {
    Write-Host "   FAIL - Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
    $fail++
}

# Summary
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "`nPassed: $pass" -ForegroundColor Green
Write-Host "Failed: $fail" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "Total:  $($pass + $fail)" -ForegroundColor Cyan

if ($fail -eq 0) {
    Write-Host "`n[SUCCESS] All tests passed!" -ForegroundColor Green
    Write-Host "Backend is fully operational." -ForegroundColor Green
    Write-Host "`nUI Available at:" -ForegroundColor Cyan
    Write-Host "https://fincore-webui-npe-lfd6ooarra-nw.a.run.app" -ForegroundColor White
} else {
    Write-Host "`n[WARNING] $fail test(s) failed." -ForegroundColor Yellow
    Write-Host "Check errors above for details." -ForegroundColor Yellow
}

Write-Host ""
