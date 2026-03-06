# Backend API Testing and Test Data Creation Script

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "FinCore Backend API Testing" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$script:API_BASE_URL = "https://fincore-npe-api-994490239798.europe-west2.run.app/api"

# Function to test API endpoint
function Test-ApiEndpoint {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    $url = $script:API_BASE_URL + $Endpoint
    Write-Host "Testing: $Method $url" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body -and $Method -ne "GET") {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        Write-Host "✓ Success" -ForegroundColor Green
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "✗ Failed: $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to get error details
        if ($_.ErrorDetails) {
            Write-Host "  Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
        }
        return $null
    }
}

# Test 1: Check API Health
Write-Host "`n1. Testing API Health Check..." -ForegroundColor Cyan
$health = Test-ApiEndpoint -Endpoint "/health"

# Test 2: Authentication
Write-Host "`n2. Testing Authentication..." -ForegroundColor Cyan
$phoneNumber = "+1234567890"

Write-Host "  Requesting OTP for $phoneNumber..." -ForegroundColor Gray
$otpRequest = Test-ApiEndpoint -Endpoint "/auth/request-otp" -Method POST -Body @{
    phoneNumber = $phoneNumber
}

if ($otpRequest) {
    Write-Host "  OTP received: $($otpRequest.devOtp)" -ForegroundColor Green
    
    Write-Host "  Verifying OTP..." -ForegroundColor Gray
    $authResponse = Test-ApiEndpoint -Endpoint "/auth/verify-otp" -Method POST -Body @{
        phoneNumber = $phoneNumber
        otp = $otpRequest.devOtp
    }
    
    if ($authResponse -and $authResponse.accessToken) {
        $token = $authResponse.accessToken
        Write-Host "  ✓ Authentication successful!" -ForegroundColor Green
        Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
        
        # Update headers with token
        $authHeaders = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }
        
        # Test 3: Get Current User
        Write-Host "`n3. Getting Current User..." -ForegroundColor Cyan
        $currentUser = Test-ApiEndpoint -Endpoint "/auth/me" -Headers $authHeaders
        if ($currentUser) {
            Write-Host "  User: $($currentUser.fullName) ($($currentUser.role))" -ForegroundColor Green
        }
        
        # Test 4: List Users
        Write-Host "`n4. Listing Users..." -ForegroundColor Cyan
        $users = Test-ApiEndpoint -Endpoint "/users" -Headers $authHeaders
        if ($users) {
            Write-Host "  Found $($users.Count) users" -ForegroundColor Green
            $users | Select-Object -First 3 | ForEach-Object {
                Write-Host "    - $($_.fullName) ($($_.email))" -ForegroundColor Gray
            }
        }
        
        # Test 5: Create Test User
        Write-Host "`n5. Creating Test User..." -ForegroundColor Cyan
        $newUser = Test-ApiEndpoint -Endpoint "/users" -Method POST -Headers $authHeaders -Body @{
            fullName = "Test User $(Get-Date -Format 'HHmmss')"
            email = "testuser$(Get-Date -Format 'HHmmss')@example.com"
            phoneNumber = "+1987654$(Get-Random -Minimum 1000 -Maximum 9999)"
            role = "VIEWER"
        }
        if ($newUser) {
            Write-Host "  ✓ User created: $($newUser.fullName)" -ForegroundColor Green
        }
        
        # Test 6: List Organizations
        Write-Host "`n6. Listing Organizations..." -ForegroundColor Cyan
        $orgs = Test-ApiEndpoint -Endpoint "/organizations" -Headers $authHeaders
        if ($orgs) {
            Write-Host "  Found $($orgs.Count) organizations" -ForegroundColor Green
            $orgs | Select-Object -First 3 | ForEach-Object {
                Write-Host "    - $($_.name) ($($_.type))" -ForegroundColor Gray
            }
        }
        
        # Test 7: Create Test Organization
        Write-Host "`n7. Creating Test Organization..." -ForegroundColor Cyan
        $newOrg = Test-ApiEndpoint -Endpoint "/organizations" -Method POST -Headers $authHeaders -Body @{
            name = "Test Corp $(Get-Date -Format 'HHmmss')"
            type = "CORPORATE"
            registrationNumber = "REG$(Get-Random -Minimum 100000 -Maximum 999999)"
            taxId = "TAX$(Get-Random -Minimum 100000 -Maximum 999999)"
            industry = "Technology"
            status = "ACTIVE"
        }
        if ($newOrg) {
            Write-Host "  ✓ Organization created: $($newOrg.name)" -ForegroundColor Green
        }
        
        # Test 8: List Questionnaires
        Write-Host "`n8. Listing Questionnaires..." -ForegroundColor Cyan
        $questionnaires = Test-ApiEndpoint -Endpoint "/questionnaires" -Headers $authHeaders
        if ($questionnaires) {
            Write-Host "  Found $($questionnaires.Count) questionnaires" -ForegroundColor Green
        }
        
        # Summary
        Write-Host "`n=====================================" -ForegroundColor Cyan
        Write-Host "Test Summary" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "✓ API is accessible and working" -ForegroundColor Green
        Write-Host "✓ Authentication working" -ForegroundColor Green
        Write-Host "✓ Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
        Write-Host "`nYou can now test the UI at:" -ForegroundColor Yellow
        Write-Host "https://fincore-webui-npe-lfd6ooarra-nw.a.run.app" -ForegroundColor Cyan
        
    } else {
        Write-Host "✗ Authentication failed" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Could not request OTP" -ForegroundColor Red
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "API Endpoint Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
$baseUrl = $script:API_BASE_URL
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "Key Endpoints:" -ForegroundColor Yellow
Write-Host "  Authentication: POST $baseUrl/auth/request-otp" -ForegroundColor Gray
Write-Host "  Users:          GET  $baseUrl/users" -ForegroundColor Gray
Write-Host "  Organizations:  GET  $baseUrl/organizations" -ForegroundColor Gray
Write-Host "  Questionnaires: GET  $baseUrl/questionnaires" -ForegroundColor Gray
Write-Host ""
