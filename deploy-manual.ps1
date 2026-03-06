# Manual Deployment Script for FinCore WebUI to GCP Cloud Run
# Use this script to deploy manually without GitHub Actions

param(
    [string]$ProjectId = "project-07a61357-b791-4255-a9e",
    [string]$Region = "europe-west2",
    [string]$ServiceName = "fincore-webui-npe",
    [string]$Repository = "fincore-webui",
    [string]$ServiceAccount = "fincore-github-actions@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com",
    [string]$ApiBaseUrl = "https://fincore-npe-api-994490239798.europe-west2.run.app"
)

$IMAGE_NAME = "app"
$SERVICE_ACCOUNT = "fincore-npe-cloudrun@$ProjectId.iam.gserviceaccount.com"

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "FinCore WebUI - Manual Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Project: $ProjectId" -ForegroundColor Gray
Write-Host "Region: $Region" -ForegroundColor Gray
Write-Host "Service: $ServiceName" -ForegroundColor Gray
Write-Host "API URL: $ApiBaseUrl" -ForegroundColor Gray
Write-Host "==================================" -ForegroundColor Cyan

# Confirm
$confirm = Read-Host "`nProceed with deployment? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Set project
Write-Host "`n[1/6] Setting GCP project..." -ForegroundColor Yellow
gcloud config set project $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to set project" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Project set" -ForegroundColor Green

# Build Docker image
Write-Host "`n[2/6] Building Docker image..." -ForegroundColor Yellow
$imageTag = "$Region-docker.pkg.dev/$ProjectId/$Repository/${IMAGE_NAME}:latest"
$imageSha = "$Region-docker.pkg.dev/$ProjectId/$Repository/${IMAGE_NAME}:$(git rev-parse --short HEAD 2>$null)"

Write-Host "Building: $imageTag" -ForegroundColor Gray
docker build -t $imageTag -t $imageSha .

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker image built" -ForegroundColor Green

# Configure Docker auth
Write-Host "`n[3/6] Configuring Docker authentication..." -ForegroundColor Yellow
gcloud auth configure-docker $Region-docker.pkg.dev --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to configure Docker" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker configured" -ForegroundColor Green

# Push to Artifact Registry
Write-Host "`n[4/6] Pushing image to Artifact Registry..." -ForegroundColor Yellow
docker push $imageTag

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to push image" -ForegroundColor Red
    exit 1
}

if ($imageSha -ne $imageTag) {
    docker push $imageSha
}

Write-Host "✓ Image pushed successfully" -ForegroundColor Green

# Deploy to Cloud Run
Write-Host "`n[5/6] Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
    --image=$imageTag `
    --region=$Region `
    --platform=managed `
    --allow-unauthenticated `
    --service-account=$SERVICE_ACCOUNT `
    --memory=512Mi `
    --cpu=1 `
    --timeout=60 `
    --max-instances=10 `
    --min-instances=0 `
    --set-env-vars="API_BASE_URL=$ApiBaseUrl" `
    --port=8080

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployed to Cloud Run" -ForegroundColor Green

# Get service URL
Write-Host "`n[6/6] Getting service URL..." -ForegroundColor Yellow
$serviceUrl = gcloud run services describe $ServiceName `
    --region=$Region `
    --format="value(status.url)"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to get service URL" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Service deployed successfully" -ForegroundColor Green

# Health check
Write-Host "`nPerforming health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "$serviceUrl/health" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Health check passed" -ForegroundColor Green
    } else {
        Write-Host "⚠ Health check returned: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Health check failed (service may still be starting)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n==================================" -ForegroundColor Green
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host "`nService URL: $serviceUrl" -ForegroundColor Cyan
Write-Host "Health Check: $serviceUrl/health" -ForegroundColor Cyan
Write-Host "Image: $imageTag" -ForegroundColor Gray
Write-Host "`n==================================" -ForegroundColor Green
