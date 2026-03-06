# Docker Cleanup Script
# Use this to stop and remove the test container

Write-Host "Cleaning up Docker test environment..." -ForegroundColor Yellow

# Add Docker to PATH if not already present
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    $env:Path += ";C:\Program Files\Docker\Docker\resources\bin"
}

$CONTAINER_NAME = "fincore-webui-test"
$IMAGE_NAME = "fincore-webui"

# Stop and remove container
Write-Host "Stopping container..." -ForegroundColor Gray
docker stop $CONTAINER_NAME 2>$null

Write-Host "Removing container..." -ForegroundColor Gray
docker rm $CONTAINER_NAME 2>$null

Write-Host "✓ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To also remove the image, run:" -ForegroundColor Yellow
Write-Host "  docker rmi ${IMAGE_NAME}:local-test" -ForegroundColor Gray
