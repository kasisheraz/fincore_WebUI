# Script to create GitHub labels for agentic AI SDLC automation
# Run this from the repository root

Write-Host "🏷️  Creating GitHub labels for agentic AI SDLC..." -ForegroundColor Cyan
Write-Host ""

# Check if gh CLI is available
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) not found. Please install it first:" -ForegroundColor Red
    Write-Host "   winget install GitHub.cli" -ForegroundColor Yellow
    exit 1
}

# Check if authenticated
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated with GitHub. Please run:" -ForegroundColor Red
    Write-Host "   gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating AI workflow labels..." -ForegroundColor Green

# AI Workflow Labels
gh label create "ai:story-analysis" --description "AI analyzing story" --color "1d76db" --force
gh label create "ai:architecture" --description "AI designing architecture" --color "5319e7" --force
gh label create "ai:development" --description "AI developing code" --color "0e8a16" --force
gh label create "ai:testing" --description "AI running tests" --color "fbca04" --force
gh label create "ai:documentation" --description "AI updating docs" --color "f9d0c4" --force
gh label create "ai:review-needed" --description "Human review required" --color "d93f0b" --force
gh label create "ai:approved" --description "AI approved changes" --color "0e8a16" --force

Write-Host "Creating environment labels..." -ForegroundColor Green

# Environment Labels
gh label create "environment:npe" --description "Non-production environment" --color "ededed" --force
gh label create "environment:staging" --description "Staging environment" --color "bfd4f2" --force
gh label create "environment:production" --description "Production environment" --color "d93f0b" --force

Write-Host "Creating complexity labels..." -ForegroundColor Green

# Complexity Labels
gh label create "complexity:low" --description "Low complexity change" --color "0e8a16" --force
gh label create "complexity:medium" --description "Medium complexity change" --color "fbca04" --force
gh label create "complexity:high" --description "High complexity change" --color "d93f0b" --force

Write-Host "Creating type labels..." -ForegroundColor Green

# Type Labels
gh label create "type:story" --description "User story" --color "1d76db" --force
gh label create "type:bug" --description "Bug report" --color "d93f0b" --force
gh label create "type:tech-debt" --description "Technical debt" --color "f9d0c4" --force

Write-Host "Creating additional labels..." -ForegroundColor Green

# Additional Labels
gh label create "multi-repo" --description "Change affects multiple repos" --color "5319e7" --force
gh label create "breaking-change" --description "API breaking change" --color "d93f0b" --force

Write-Host ""
Write-Host "✅ All labels created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "You can view them at:" -ForegroundColor Cyan
Write-Host "https://github.com/kasisheraz/fincore_WebUI/labels" -ForegroundColor Blue
