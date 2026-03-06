# Local Docker Testing Script for fincore_WebUI
# This script builds and runs the Docker container locally before deploying to GitHub Actions

Write-Host "================================" -ForegroundColor Cyan
Write-Host "FinCore WebUI - Local Docker Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check WSL is installed (required for ARM Windows)
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$cpu = (Get-ComputerInfo).CsProcessors[0].Name
if ($cpu -match "Snapdragon|Qualcomm|ARM") {
    try {
        wsl --status | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "WSL not installed"
        }
    } catch {
        Write-Host "✗ WSL 2 is required for Docker Desktop on ARM Windows" -ForegroundColor Red
        Write-Host ""
        Write-Host "Run this script to install WSL:" -ForegroundColor Yellow
        Write-Host "  .\setup-wsl.ps1" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Or see: WSL_SETUP_GUIDE.md" -ForegroundColor Gray
        exit 1
    }
}

# Add Docker to PATH if not already present
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Adding Docker to PATH..." -ForegroundColor Yellow
    $env:Path += ";C:\Program Files\Docker\Docker\resources\bin"
}

# Verify Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Write-Host ""
    Write-Host "If Docker Desktop won't start:" -ForegroundColor Yellow
    Write-Host "  • Make sure WSL 2 is installed (.\setup-wsl.ps1)" -ForegroundColor Gray
    Write-Host "  • Restart your computer after installing WSL" -ForegroundColor Gray
    Write-Host "  • See: WSL_SETUP_GUIDE.md" -ForegroundColor Gray
    exit 1
}

# Configuration
$IMAGE_NAME = "fincore-webui"
$TAG = "local-test"
$CONTAINER_NAME = "fincore-webui-test"
$PORT = "8080"

Write-Host ""
Write-Host "Step 1: Cleaning up any existing containers..." -ForegroundColor Yellow
docker stop $CONTAINER_NAME 2>$null
docker rm $CONTAINER_NAME 2>$null
Write-Host "✓ Cleanup complete" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Building Docker image..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first build..." -ForegroundColor Gray
docker build -t ${IMAGE_NAME}:${TAG} .

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker image built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Running container..." -ForegroundColor Yellow
docker run -d --name $CONTAINER_NAME -p ${PORT}:8080 ${IMAGE_NAME}:${TAG}

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start container!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Container started successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Waiting for container to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check container health
$containerStatus = docker ps --filter "name=$CONTAINER_NAME" --format "{{.Status}}"
Write-Host "Container status: $containerStatus" -ForegroundColor Gray

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✓ SUCCESS!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your application is now running at:" -ForegroundColor White
Write-Host "  http://localhost:$PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  View logs:        docker logs $CONTAINER_NAME" -ForegroundColor Gray
Write-Host "  Follow logs:      docker logs -f $CONTAINER_NAME" -ForegroundColor Gray
Write-Host "  Stop container:   docker stop $CONTAINER_NAME" -ForegroundColor Gray
Write-Host "  Remove container: docker rm $CONTAINER_NAME" -ForegroundColor Gray
Write-Host "  List containers:  docker ps -a" -ForegroundColor Gray
Write-Host ""
Write-Host "Test the health endpoint:" -ForegroundColor Yellow
Write-Host "  curl http://localhost:$PORT/health" -ForegroundColor Gray
Write-Host ""

# Open browser
$openBrowser = Read-Host "Open browser now? (Y/n)"
if ($openBrowser -eq "" -or $openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "http://localhost:$PORT"
}
