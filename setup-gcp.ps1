# GCP Setup Script for FinCore WebUI Deployment
# This script sets up the GCP infrastructure needed to deploy the WebUI

param(
    [switch]$NonInteractive
)

# Configuration
$PROJECT_ID = "project-07a61357-b791-4255-a9e"
$REGION = "europe-west2"
$REPOSITORY_NAME = "fincore-webui"
$SERVICE_NAME = "fincore-webui-npe"
$SERVICE_ACCOUNT = "fincore-github-actions@$PROJECT_ID.iam.gserviceaccount.com"

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "FinCore WebUI - GCP Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID" -ForegroundColor Gray
Write-Host "Region: $REGION" -ForegroundColor Gray
Write-Host "Repository: $REPOSITORY_NAME" -ForegroundColor Gray
Write-Host "==================================" -ForegroundColor Cyan

# Confirm before proceeding (unless NonInteractive)
if (-not $NonInteractive) {
    $confirm = Read-Host "`nProceed with GCP setup? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Check gcloud CLI
Write-Host "`n[1/5] Checking gcloud CLI..." -ForegroundColor Yellow
$gcloudCheck = gcloud version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] gcloud CLI found" -ForegroundColor Green
} else {
    Write-Host "[ERROR] gcloud CLI not found. Please install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
    exit 1
}

# Set active project
Write-Host "`n[2/5] Setting active project..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Project set to $PROJECT_ID" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to set project" -ForegroundColor Red
    exit 1
}

# Create Artifact Registry repository
Write-Host "`n[3/5] Creating Artifact Registry repository..." -ForegroundColor Yellow
$repoExists = gcloud artifacts repositories describe $REPOSITORY_NAME --location=$REGION 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Repository '$REPOSITORY_NAME' already exists" -ForegroundColor Yellow
} else {
    Write-Host "Creating repository..." -ForegroundColor Gray
    gcloud artifacts repositories create $REPOSITORY_NAME `
        --repository-format=docker `
        --location=$REGION `
        --description="FinCore WebUI Docker images"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Repository created successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create repository" -ForegroundColor Red
        exit 1
    }
}

# Configure Docker for Artifact Registry
Write-Host "`n[4/5] Configuring Docker for Artifact Registry..." -ForegroundColor Yellow
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Docker configured" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to configure Docker" -ForegroundColor Red
    exit 1
}

# Verify service account
Write-Host "`n[5/5] Verifying service account..." -ForegroundColor Yellow
$saExists = gcloud iam service-accounts describe $SERVICE_ACCOUNT 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Service account exists: $SERVICE_ACCOUNT" -ForegroundColor Green
    
    # Grant Artifact Registry Writer role (if not already granted)
    Write-Host "Granting Artifact Registry Writer role..." -ForegroundColor Gray
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:$SERVICE_ACCOUNT" `
        --role="roles/artifactregistry.writer" `
        --condition=None 2>&1 | Out-Null
    
    Write-Host "[OK] Service account has necessary permissions" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Service account not found: $SERVICE_ACCOUNT" -ForegroundColor Red
    Write-Host "Please create the service account first or check the name." -ForegroundColor Yellow
    exit 1
}

# Summary
Write-Host "`n==================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Configure GitHub Secrets:" -ForegroundColor White
Write-Host "   • GCP_PROJECT_ID: $PROJECT_ID" -ForegroundColor Gray
Write-Host "   • GCP_REGION: $REGION" -ForegroundColor Gray
Write-Host "   • GCP_SA_KEY: Service account JSON key" -ForegroundColor Gray
Write-Host "   • API_BASE_URL: https://fincore-npe-api-994490239798.europe-west2.run.app" -ForegroundColor Gray

Write-Host "`n2. Build and test locally:" -ForegroundColor White
Write-Host "   docker build -t test:latest ." -ForegroundColor Gray
Write-Host "   docker run -p 8080:8080 test:latest" -ForegroundColor Gray

Write-Host "`n3. Deploy via GitHub Actions:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'feat: Add GCP deployment configuration'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray

Write-Host "`n4. Or deploy manually:" -ForegroundColor White
Write-Host "   .\deploy-manual.ps1" -ForegroundColor Gray

Write-Host "`n==================================" -ForegroundColor Cyan
