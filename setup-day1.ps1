# 🚀 Complete Day 1 Setup
# Run this script in a NEW PowerShell terminal (after gh CLI is installed)

Write-Host "🤖 Agentic AI SDLC - Day 1 Setup Completion" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check GitHub CLI
Write-Host "Step 1: Checking GitHub CLI..." -ForegroundColor Yellow
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "✅ GitHub CLI is installed" -ForegroundColor Green
} else {
    Write-Host "❌ GitHub CLI not found in PATH" -ForegroundColor Red
    Write-Host "Please close this terminal and open a NEW PowerShell terminal, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Check Authentication
Write-Host "Step 2: Checking GitHub authentication..." -ForegroundColor Yellow
$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Already authenticated with GitHub" -ForegroundColor Green
} else {
    Write-Host "⚠️  Not authenticated. Let's log in..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please authenticate with GitHub (choose your preferred method):" -ForegroundColor Cyan
    gh auth login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Authentication failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Successfully authenticated!" -ForegroundColor Green
}

Write-Host ""

# Step 3: Set Repository
Write-Host "Step 3: Setting repository context..." -ForegroundColor Yellow
$currentRepo = gh repo view --json nameWithOwner -q .nameWithOwner 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repository: $currentRepo" -ForegroundColor Green
} else {
    Write-Host "⚠️  Setting default repository..." -ForegroundColor Yellow
    gh repo set-default kasisheraz/fincore_WebUI
}

Write-Host ""

# Step 4: Create Labels
Write-Host "Step 4: Creating GitHub labels..." -ForegroundColor Yellow
Write-Host "This will create all the necessary labels for AI automation." -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Create labels now? (Y/n)"
if ($confirm -eq "" -or $confirm -eq "Y" -or $confirm -eq "y") {
    & .\.github\scripts\create-labels.ps1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Labels created successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some labels may have failed, but that's okay if they already exist" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipped label creation" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Day 1 Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 5: Next Steps
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. View your labels:" -ForegroundColor White
Write-Host "   https://github.com/kasisheraz/fincore_WebUI/labels" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Create a test story:" -ForegroundColor White
Write-Host "   https://github.com/kasisheraz/fincore_WebUI/issues/new/choose" -ForegroundColor Blue
Write-Host ""
Write-Host "3. Watch the AI analyze it:" -ForegroundColor White
Write-Host "   https://github.com/kasisheraz/fincore_WebUI/actions" -ForegroundColor Blue
Write-Host ""
Write-Host "4. Read the next steps guide:" -ForegroundColor White
Write-Host "   code DAY1_NEXT_STEPS.md" -ForegroundColor Blue
Write-Host ""

# Open browser to issues page
$openBrowser = Read-Host "Open GitHub issues page to create a test story? (Y/n)"
if ($openBrowser -eq "" -or $openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "https://github.com/kasisheraz/fincore_WebUI/issues/new/choose"
    Write-Host "✅ Browser opened!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 You're ready to test your first AI agent!" -ForegroundColor Green
Write-Host ""
