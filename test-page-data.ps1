# UI Page Diagnostic - Check what data is actually returned

$API_BASE = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$PHONE = "+1234567890"

Write-Host "=== UI PAGE DIAGNOSTIC ===" -ForegroundColor Yellow

# Get auth
$otpResp = Invoke-RestMethod -Uri "$API_BASE/auth/request-otp" -Method POST -Body (@{phoneNumber=$PHONE} | ConvertTo-Json) -ContentType "application/json"
$authResp = Invoke-RestMethod -Uri "$API_BASE/auth/verify-otp" -Method POST -Body (@{phoneNumber=$PHONE; otp=$otpResp.devOtp} | ConvertTo-Json) -ContentType "application/json"
$headers = @{ "Authorization" = "Bearer $($authResp.accessToken)" }

Write-Host "`n== USERS PAGE DATA ==" -ForegroundColor Cyan
try {
    $users = Invoke-RestMethod -Uri "$API_BASE/users?page=0&size=10&sortBy=id&sortDirection=desc" -Headers $headers
    Write-Host "Total Users: $($users.totalElements)" -ForegroundColor Green
    Write-Host "Returned: $($users.content.Count) users" -ForegroundColor Green
    if ($users.content.Count -gt 0) {
        Write-Host "`nFirst 3 users:" -ForegroundColor White
        $users.content | Select-Object -First 3 | ForEach-Object {
            Write-Host "  ID: $($_.id) - $($_.firstName) $($_.lastName) ($($_.email))" -ForegroundColor Gray
        }
    } else {
        Write-Host "NO USERS FOUND IN DATABASE!" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n== ORGANIZATIONS PAGE DATA ==" -ForegroundColor Cyan
try {
    $orgs = Invoke-RestMethod -Uri "$API_BASE/organizations?page=0&size=10" -Headers $headers
    Write-Host "Total Organizations: $($orgs.totalElements)" -ForegroundColor Green
    Write-Host "Returned: $($orgs.content.Count) organizations" -ForegroundColor Green
    if ($orgs.content.Count -gt 0) {
        Write-Host "`nOrganizations:" -ForegroundColor White
        $orgs.content | ForEach-Object {
            Write-Host "  ID: $($_.id) - $($_.legalName)" -ForegroundColor Gray
        }
    } else {
        Write-Host "NO ORGANIZATIONS FOUND!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n== KYC DOCUMENTS PAGE DATA ==" -ForegroundColor Cyan
try {
    $docs = Invoke-RestMethod -Uri "$API_BASE/kyc-documents?page=0&size=10" -Headers $headers
    Write-Host "Total KYC Documents: $($docs.totalElements)" -ForegroundColor Green
    Write-Host "Returned: $($docs.content.Count) documents" -ForegroundColor Green
    if ($docs.content.Count -eq 0) {
        Write-Host "No documents in database (this is OK)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n== KYC VERIFICATIONS PAGE DATA ==" -ForegroundColor Cyan
try {
    $verifs = Invoke-RestMethod -Uri "$API_BASE/kyc-verifications?page=0&size=10" -Headers $headers
    Write-Host "Total KYC Verifications: $($verifs.totalElements)" -ForegroundColor Green
    Write-Host "Returned: $($verifs.content.Count) verifications" -ForegroundColor Green
    if ($verifs.content.Count -eq 0) {
        Write-Host "No verifications in database (this is OK)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n== QUESTIONNAIRES PAGE DATA ==" -ForegroundColor Cyan
try {
    $quests = Invoke-RestMethod -Uri "$API_BASE/questionnaires?page=0&size=10" -Headers $headers
    Write-Host "Total Questionnaires: $($quests.totalElements)" -ForegroundColor Green
    Write-Host "Returned: $($quests.content.Count) questionnaires" -ForegroundColor Green
    if ($quests.content.Count -eq 0) {
        Write-Host "No questionnaires in database - CREATE is broken (backend bug)" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n== CUSTOMER ANSWERS PAGE DATA ==" -ForegroundColor Cyan
try {
    $answers = Invoke-RestMethod -Uri "$API_BASE/customer-answers?page=0&size=10" -Headers $headers
    Write-Host "Total Customer Answers: $($answers.totalElements)" -ForegroundColor Green
    Write-Host "Returned: $($answers.content.Count) answers" -ForegroundColor Green
    if ($answers.content.Count -eq 0) {
        Write-Host "No answers (no questions exist to answer)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n== DIAGNOSIS COMPLETE ==" -ForegroundColor Yellow
Write-Host "If you see data above but NOT in the UI:" -ForegroundColor White
Write-Host "1. Clear browser cache: Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "2. Clear localStorage: F12 > Console > localStorage.clear(); sessionStorage.clear(); location.reload();" -ForegroundColor White
Write-Host "3. Hard refresh: Ctrl+F5" -ForegroundColor White
Write-Host "4. Check browser console (F12) for JavaScript errors" -ForegroundColor White
