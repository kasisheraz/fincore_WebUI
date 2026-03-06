# Local Docker Testing Guide

This guide helps you test your Docker setup locally before deploying to GitHub Actions.

## Prerequisites

1. **Docker Desktop** must be installed and running
   - Download from: https://www.docker.com/products/docker-desktop/
   - Look for the Docker whale icon in your system tray
   - It should show "Docker Desktop is running"

## Quick Start

### Option 1: Use the Automated Script (Recommended)

```powershell
.\docker-test-local.ps1
```

This script will:
- ✓ Check Docker is running
- ✓ Build your Docker image
- ✓ Run the container on port 8080
- ✓ Open your browser to test the app

### Option 2: Manual Steps

If you prefer to run commands manually:

#### 1. Build the Docker Image
```powershell
docker build -t fincore-webui:local-test .
```

This creates a Docker image with your React app bundled with nginx.

#### 2. Run the Container
```powershell
docker run -d --name fincore-webui-test -p 8080:8080 fincore-webui:local-test
```

This starts the container and maps port 8080 to your localhost.

#### 3. Test the Application

Open your browser to:
- **Main App**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

Or use curl:
```powershell
curl http://localhost:8080/health
```

#### 4. View Logs
```powershell
# View all logs
docker logs fincore-webui-test

# Follow logs in real-time
docker logs -f fincore-webui-test
```

#### 5. Clean Up
```powershell
# Stop the container
docker stop fincore-webui-test

# Remove the container
docker rm fincore-webui-test

# Remove the image (optional)
docker rmi fincore-webui:local-test
```

Or use the cleanup script:
```powershell
.\docker-cleanup.ps1
```

## Testing Checklist

Before deploying to GitHub Actions, verify:

- [ ] Docker image builds successfully without errors
- [ ] Container starts and runs without crashing
- [ ] Application loads at http://localhost:8080
- [ ] Health check endpoint returns "healthy" at http://localhost:8080/health
- [ ] All routes work (React Router configured correctly)
- [ ] Static assets load properly (CSS, JS, images)
- [ ] No console errors in browser developer tools

## Common Issues

### "Docker is not running"
**Solution**: Start Docker Desktop from your Start menu and wait for it to fully start (30-60 seconds).

### "Port 8080 is already in use"
**Solution**: Either:
- Stop the existing container: `docker stop fincore-webui-test`
- Use a different port: `docker run -d --name fincore-webui-test -p 3000:8080 fincore-webui:local-test`
  (Then access at http://localhost:3000)

### "Build failed" or "npm install errors"
**Solution**: 
- Check your internet connection
- Clear npm cache: `npm cache clean --force`
- Try rebuilding: `docker build --no-cache -t fincore-webui:local-test .`

### Container stops immediately after starting
**Solution**: Check the logs for errors:
```powershell
docker logs fincore-webui-test
```

## Useful Commands

```powershell
# List all containers (running and stopped)
docker ps -a

# List all images
docker images

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# View container resource usage
docker stats fincore-webui-test

# Execute commands inside the container
docker exec -it fincore-webui-test sh

# Inspect container details
docker inspect fincore-webui-test
```

## Next Steps

Once local testing is successful:

1. ✓ Verify your `.dockerignore` file (prevents unnecessary files from entering the image)
2. ✓ Review your `Dockerfile` for any optimizations
3. ✓ Commit your changes to git
4. ✓ Push to GitHub to trigger GitHub Actions workflow
5. ✓ Monitor the GitHub Actions build process
6. ✓ Deploy to Google Cloud Run

## Differences Between Local and Production

| Aspect | Local Testing | GitHub Actions/GCP |
|--------|--------------|-------------------|
| Build Environment | Your machine | GitHub runners |
| Image Registry | Local only | Google Artifact Registry |
| Port Mapping | localhost:8080 | Cloud Run auto-assigned |
| Environment Variables | Manual setup | GitHub Secrets |
| SSL/HTTPS | Requires setup | Automatic with Cloud Run |

## Performance Tips

- **First build** takes longer (downloading base images, installing dependencies)
- **Subsequent builds** are faster (Docker layer caching)
- Use `--no-cache` flag to force a clean build if needed

## Security Notes

- The production image uses multi-stage builds (build artifacts not in final image)
- nginx runs as non-root user in the alpine image
- Security headers are configured in nginx.conf
- Static assets are cached, but index.html is not (for updates)

---

**Ready to deploy?** Once everything works locally, your GitHub Actions workflow will follow the same build process automatically!
