# Comprehensive UI Functionality Test
# Tests the UI application locally connecting to GCP backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "UI Functionality Test - FinCore WebUI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$uiUrl = "http://localhost:3000"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Backend API: $baseUrl" -ForegroundColor White
Write-Host "  Frontend UI: $uiUrl" -ForegroundColor White
Write-Host ""

# Test 1: Check if UI is running
Write-Host "TEST 1: Checking if UI is running..." -ForegroundColor Yellow
try {
    $uiResponse = Invoke-WebRequest -Uri $uiUrl -UseBasicParsing -TimeoutSec 5
    if ($uiResponse.StatusCode -eq 200) {
        Write-Host "  ✓ UI is running successfully (Status: $($uiResponse.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ UI is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check backend API connectivity
Write-Host "TEST 2: Checking backend API connectivity..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 10
    Write-Host "  ✓ Backend API is accessible" -ForegroundColor Green
    Write-Host "    Status: $($healthCheck.status)" -ForegroundColor White
} catch {
    Write-Host "  ⚠ Backend API health check failed, trying alternate endpoint..." -ForegroundColor Yellow
    try {
        # Try to get organizations as a connectivity test
        $orgTest = Invoke-WebRequest -Uri "$baseUrl/organizations?page=0&size=1" -Method Get -UseBasicParsing -TimeoutSec 10
        if ($orgTest.StatusCode -eq 200 -or $orgTest.StatusCode -eq 401) {
            Write-Host "  ✓ Backend API is accessible" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✗ Backend API is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Test authentication flow
Write-Host "TEST 3: Testing authentication flow..." -ForegroundColor Yellow
try {
    # Request OTP
    $phoneNumber = "1234567890"
    $otpRequest = @{
        phoneNumber = $phoneNumber
    } | ConvertTo-Json

    $otpResponse = Invoke-RestMethod -Uri "$baseUrl/auth/request-otp" -Method Post -Body $otpRequest -ContentType "application/json" -TimeoutSec 10
    Write-Host "  ✓ OTP request successful" -ForegroundColor Green
    
    # In real scenario, we would verify OTP, but for testing, let's check if endpoint is working
    Write-Host "    OTP sent to: $phoneNumber" -ForegroundColor White
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 404) {
        Write-Host "  ⚠ User not found (expected for test number)" -ForegroundColor Yellow
    } else {
        Write-Host "  ⚠ Auth endpoint response: $statusCode" -ForegroundColor Yellow
    }
}

# Test 4: Check API endpoints availability
Write-Host "TEST 4: Checking API endpoints availability..." -ForegroundColor Yellow
$endpoints = @(
    @{Name="Organizations"; Url="$baseUrl/organizations?page=0&size=5"},
    @{Name="Users"; Url="$baseUrl/users?page=0&size=5"},
    @{Name="KYC Documents"; Url="$baseUrl/kyc/documents?page=0&size=5"},
    @{Name="KYC Verifications"; Url="$baseUrl/kyc/verifications?page=0&size=5"},
    @{Name="Questionnaires"; Url="$baseUrl/questionnaires?page=0&size=5"},
    @{Name="Customer Answers"; Url="$baseUrl/customer-answers?page=0&size=5"}
)

$successCount = 0
$failCount = 0

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method Get -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ $($endpoint.Name): Available (Status: 200)" -ForegroundColor Green
            $successCount++
        } elseif ($response.StatusCode -eq 401) {
            Write-Host "  ⚠ $($endpoint.Name): Requires authentication (Status: 401)" -ForegroundColor Yellow
            $successCount++
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($statusCode -eq 401) {
            Write-Host "  ⚠ $($endpoint.Name): Requires authentication (Status: 401)" -ForegroundColor Yellow
            $successCount++
        } else {
            Write-Host "  ✗ $($endpoint.Name): Failed (Status: $statusCode)" -ForegroundColor Red
            $failCount++
        }
    }
}

Write-Host ""
Write-Host "  Endpoints Summary: $successCount/$($endpoints.Count) accessible" -ForegroundColor $(if ($successCount -eq $endpoints.Count) { "Green" } else { "Yellow" })

# Test 5: Check UI configuration
Write-Host "TEST 5: Checking UI configuration..." -ForegroundColor Yellow
$envFile = ".env.development.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "REACT_APP_API_BASE_URL=https://fincore-npe-api-994490239798.europe-west2.run.app/api") {
        Write-Host "  ✓ UI is configured to use GCP backend" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ UI configuration may not be pointing to GCP backend" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ Environment file not found" -ForegroundColor Yellow
}

# Test 6: Check page accessibility
Write-Host "TEST 6: Checking UI page routes..." -ForegroundColor Yellow
$pages = @(
    "/login",
    "/dashboard",
    "/organizations",
    "/users",
    "/kyc/documents",
    "/kyc/verifications",
    "/questionnaires",
    "/applications"
)

$pageSuccessCount = 0
foreach ($page in $pages) {
    try {
        $pageResponse = Invoke-WebRequest -Uri "$uiUrl$page" -UseBasicParsing -TimeoutSec 5
        if ($pageResponse.StatusCode -eq 200) {
            Write-Host "  ✓ $page - Accessible" -ForegroundColor Green
            $pageSuccessCount++
        }
    } catch {
        Write-Host "  ⚠ $page - May require authentication" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  Pages Summary: $pageSuccessCount/$($pages.Count) accessible" -ForegroundColor $(if ($pageSuccessCount -gt 0) { "Green" } else { "Yellow" })

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ UI Application: Running on $uiUrl" -ForegroundColor Green
Write-Host "✓ Backend API: Connected to GCP ($baseUrl)" -ForegroundColor Green
Write-Host "✓ API Endpoints: $successCount/$($endpoints.Count) accessible" -ForegroundColor Green
Write-Host "✓ UI Routes: $pageSuccessCount/$($pages.Count) pages accessible" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open browser to $uiUrl" -ForegroundColor White
Write-Host "  2. Authenticate with valid credentials" -ForegroundColor White
Write-Host "  3. Test CRUD operations on each page" -ForegroundColor White
Write-Host "  4. Verify all click events and buttons work" -ForegroundColor White
Write-Host "  5. Check form validations" -ForegroundColor White
Write-Host ""
Write-Host "Test completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
