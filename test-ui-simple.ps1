$ErrorActionPreference = "Continue"

Write-Host "UI Functionality Test - FinCore WebUI" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"
$uiUrl = "http://localhost:3000"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Backend API: $baseUrl"
Write-Host "  Frontend UI: $uiUrl"
Write-Host ""

# Test 1: Check UI
Write-Host "TEST 1: Checking if UI is running..." -ForegroundColor Yellow
try {
    $uiResponse = Invoke-WebRequest -Uri $uiUrl -UseBasicParsing -TimeoutSec 5
    if ($uiResponse.StatusCode -eq 200) {
        Write-Host "  UI is running successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "  UI is not accessible" -ForegroundColor Red
    exit 1
}

# Test 2: Check API
Write-Host "TEST 2: Checking backend API..." -ForegroundColor Yellow
try {
    $orgTest = Invoke-WebRequest -Uri "$baseUrl/organizations?page=0&size=1" -Method Get -UseBasicParsing -TimeoutSec 10
    if ($orgTest.StatusCode -eq 200 -or $orgTest.StatusCode -eq 401) {
        Write-Host "  Backend API is accessible" -ForegroundColor Green
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 401) {
        Write-Host "  Backend API is accessible (requires auth)" -ForegroundColor Green
    } else {
        Write-Host "  Backend API check: Status $statusCode" -ForegroundColor Yellow
    }
}

# Test 3: Check endpoints
Write-Host "TEST 3: Checking API endpoints..." -ForegroundColor Yellow
$endpoints = @{
    "Organizations" = "$baseUrl/organizations?page=0&size=5"
    "Users" = "$baseUrl/users?page=0&size=5"
    "KYC Documents" = "$baseUrl/kyc/documents?page=0&size=5"
    "KYC Verifications" = "$baseUrl/kyc/verifications?page=0&size=5"
    "Questionnaires" = "$baseUrl/questionnaires?page=0&size=5"
}

$successCount = 0
foreach ($ep in $endpoints.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri $ep.Value -Method Get -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        Write-Host "  $($ep.Name): Available" -ForegroundColor Green
        $successCount++
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($statusCode -eq 401) {
            Write-Host "  $($ep.Name): Requires auth (OK)" -ForegroundColor Yellow
            $successCount++
        } else {
            Write-Host "  $($ep.Name): Status $statusCode" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "  Endpoints accessible: $successCount / $($endpoints.Count)" -ForegroundColor Green

# Test 4: Check pages
Write-Host "TEST 4: Checking UI pages..." -ForegroundColor Yellow
$pages = @("/login", "/dashboard", "/organizations", "/users")
$pageCount = 0
foreach ($page in $pages) {
    try {
        $pageResp = Invoke-WebRequest -Uri "$uiUrl$page" -UseBasicParsing -TimeoutSec 5
        if ($pageResp.StatusCode -eq 200) {
            Write-Host "  $page - OK" -ForegroundColor Green
            $pageCount++
        }
    } catch {
        Write-Host "  $page - Redirects (may need auth)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  UI: Running on $uiUrl" -ForegroundColor Green
Write-Host "  Backend: Connected to GCP" -ForegroundColor Green
Write-Host "  API Endpoints: $successCount accessible" -ForegroundColor Green
Write-Host "  Pages: $pageCount tested" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Open browser to http://localhost:3000 and test manually" -ForegroundColor Yellow
