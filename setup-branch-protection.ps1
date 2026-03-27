#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Configure GitHub branch protection for no-review workflow
    
.DESCRIPTION
    Sets up branch protection rules that:
    - Require status checks (GitHub Actions tests) to pass before merge
    - Do NOT require pull request reviews
    - Allow direct merge when tests pass
    
.NOTES
    Requires: GitHub Personal Access Token with repo admin access
    Set as environment variable: GITHUB_TOKEN
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Token = $env:GITHUB_TOKEN,
    
    [Parameter(Mandatory=$false)]
    [string]$Owner = "kasisheraz",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("userManagementApi", "fincore_WebUI", "both")]
    [string]$Repo = "both"
)

if (-not $Token) {
    Write-Host "❌ ERROR: GitHub token not found!" -ForegroundColor Red
    Write-Host "Please set GITHUB_TOKEN environment variable or pass -Token parameter" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To create a token:" -ForegroundColor Cyan
    Write-Host "1. Go to https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. Click 'Generate new token (classic)'" -ForegroundColor White
    Write-Host "3. Select scopes: repo (all), admin:repo_hook" -ForegroundColor White
    Write-Host "4. Copy the token and set it:" -ForegroundColor White
    Write-Host '   $env:GITHUB_TOKEN = "your_token_here"' -ForegroundColor Gray
    exit 1
}

function Set-BranchProtection {
    param(
        [string]$Repository,
        [string]$Branch = "main"
    )
    
    Write-Host "🔧 Configuring branch protection for $Owner/$Repository..." -ForegroundColor Cyan
    
    # GitHub API endpoint
    $uri = "https://api.github.com/repos/$Owner/$Repository/branches/$Branch/protection"
    
    # Branch protection configuration
    $config = @{
        required_status_checks = @{
            strict = $true  # Require branches to be up to date before merging
            contexts = @("build-and-test")  # Name of GitHub Actions workflow
        }
        enforce_admins = $false  # Allow admins to bypass (you as solo developer)
        required_pull_request_reviews = $null  # NO REVIEWS REQUIRED
        restrictions = $null  # No restrictions on who can push
        required_linear_history = $false
        allow_force_pushes = $false
        allow_deletions = $false
        required_conversation_resolution = $false
    } | ConvertTo-Json -Depth 10
    
    try {
        $headers = @{
            Authorization = "Bearer $Token"
            Accept = "application/vnd.github+json"
            "X-GitHub-Api-Version" = "2022-11-28"
        }
        
        $response = Invoke-RestMethod -Uri $uri -Method Put -Headers $headers -Body $config -ContentType "application/json"
        
        Write-Host "✅ Branch protection configured successfully!" -ForegroundColor Green
        Write-Host "   - Required status checks: YES (tests must pass)" -ForegroundColor White
        Write-Host "   - Required reviews: NO (auto-merge when tests pass)" -ForegroundColor White
        Write-Host "   - Enforce for admins: NO (you can bypass if needed)" -ForegroundColor White
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "❌ Failed to configure branch protection" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Yellow
        Write-Host ""
        return $false
    }
}

# Configure repositories
$repos = @()
if ($Repo -eq "both") {
    $repos = @("userManagementApi", "fincore_WebUI")
} else {
    $repos = @($Repo)
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  GitHub Branch Protection Configuration" -ForegroundColor Yellow
Write-Host "  No-Review Workflow for Solo Developer" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$successCount = 0
foreach ($repository in $repos) {
    if (Set-BranchProtection -Repository $repository) {
        $successCount++
    }
}

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "✅ Configuration complete: $successCount/$($repos.Count) repositories" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Ensure GitHub Actions workflows are set up" -ForegroundColor White
Write-Host "2. Test by creating a PR - it should auto-merge when tests pass" -ForegroundColor White
Write-Host "3. Pre-push hooks are installed to run tests locally first" -ForegroundColor White
Write-Host ""
