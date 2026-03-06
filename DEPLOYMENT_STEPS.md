# FinCore WebUI - GCP Deployment Steps

## Quick Start (Recommended)

### 1. Run GCP Setup Script
```powershell
.\setup-gcp.ps1
```

This script will:
- ✓ Verify gcloud CLI installation
- ✓ Set active project to `project-07a61357-b791-4255-a9e`
- ✓ Create Artifact Registry repository `fincore-webui`
- ✓ Configure Docker authentication
- ✓ Verify service account permissions

### 2. Configure GitHub Secrets

Go to: `https://github.com/kasisheraz/fincore_WebUI/settings/secrets/actions`

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | `project-07a61357-b791-4255-a9e` |
| `GCP_SA_KEY` | *Service account JSON key content* |
| `GCP_REGION` | `europe-west2` |
| `API_BASE_URL` | `https://fincore-npe-api-994490239798.europe-west2.run.app` |

**Getting the Service Account Key:**

If you don't already have the key used for the backend:

```bash
# Option 1: Reuse existing key from backend deployment
# Copy GCP_SA_KEY from userManagementApi repository secrets

# Option 2: Create a new key
gcloud iam service-accounts keys create webui-key.json \
  --iam-account=fincore-npe-cloudrun@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com

# Copy the entire content of webui-key.json to GCP_SA_KEY secret
cat webui-key.json
```

### 3. Deploy via GitHub Actions (Automatic)

```bash
git add .
git commit -m "feat: Add GCP deployment configuration"
git push origin main
```

The GitHub Actions workflow will:
1. Run Playwright tests
2. Build Docker image
3. Push to Artifact Registry
4. Deploy to Cloud Run
5. Perform health check

Monitor deployment: `https://github.com/kasisheraz/fincore_WebUI/actions`

---

## Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

```powershell
.\deploy-manual.ps1
```

This script will:
1. Build Docker image locally
2. Push to Artifact Registry
3. Deploy to Cloud Run
4. Run health check

---

## Verifying Deployment

### Check Deployment Status
```bash
gcloud run services describe fincore-webui-npe \
  --region=europe-west2 \
  --format='value(status.url)'
```

### Test Health Endpoint
```bash
curl https://YOUR-SERVICE-URL/health
```

Expected response: `healthy`

### View Logs
```bash
gcloud run services logs tail fincore-webui-npe --region=europe-west2
```

### List All Deployments
```bash
gcloud run services list --region=europe-west2
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│   GitHub Repository (fincore_WebUI)                 │
│   • React 18 + TypeScript                          │
│   • Material-UI v5                                 │
│   • 138 Playwright E2E Tests                       │
└──────────────┬──────────────────────────────────────┘
               │ Push to main
               ▼
┌─────────────────────────────────────────────────────┐
│   GitHub Actions (.github/workflows/deploy-gcp.yml) │
│   1. npm test (Playwright)                         │
│   2. docker build                                  │
│   3. Push to Artifact Registry                      │
│   4. Deploy to Cloud Run                           │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│   Artifact Registry (europe-west2)                  │
│   • Repository: fincore-webui                      │
│   • Image: app:latest                              │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│   Cloud Run (europe-west2)                          │
│   • Service: fincore-webui-npe                     │
│   • Image: nginx serving React build               │
│   • Port: 8080                                     │
│   • Memory: 512Mi, CPU: 1                          │
│   • Scaling: 0-10 instances                        │
│   • Auth: Public (unauthenticated)                 │
└──────────────┬──────────────────────────────────────┘
               │ API Calls
               ▼
┌─────────────────────────────────────────────────────┐
│   Backend API (Cloud Run)                           │
│   • Service: fincore-npe-api                       │
│   • URL: fincore-npe-api-*.run.app                 │
│   • Database: Cloud SQL MySQL                       │
└─────────────────────────────────────────────────────┘
```

---

## Environment Variables

### Build Time (.env.production)
```env
REACT_APP_API_BASE_URL=https://fincore-npe-api-994490239798.europe-west2.run.app/api
REACT_APP_MOCK_AUTH=false
```

These are baked into the React build during `npm run build`.

### Runtime (Cloud Run)
```bash
API_BASE_URL=https://fincore-npe-api-994490239798.europe-west2.run.app
ENVIRONMENT=npe
```

Set via `--set-env-vars` in deployment command.

---

## Costs (Estimated)

**Cloud Run Pricing (Pay per use):**
- **1M requests/month**: ~$5-10
- **10M requests/month**: ~$30-50

**Artifact Registry Storage:**
- **<10GB**: Free
- **10-100GB**: ~$1-10/month

**Total Estimated**: **$5-20/month** for typical usage

Benefits of using existing project:
- ✅ Shared infrastructure (no duplicate costs)
- ✅ Single billing account
- ✅ Reuse service accounts and IAM

---

## Troubleshooting

### Issue: Docker build fails
```powershell
# Clear Docker cache
docker system prune -a

# Rebuild
docker build --no-cache -t test:latest .
```

### Issue: Push to Artifact Registry fails
```bash
# Re-authenticate
gcloud auth configure-docker europe-west2-docker.pkg.dev

# Verify repository exists
gcloud artifacts repositories list --location=europe-west2
```

### Issue: Deployment fails with IAM error
```bash
# Verify service account has correct roles
gcloud projects get-iam-policy project-07a61357-b791-4255-a9e \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:fincore-npe-cloudrun*"

# Required roles:
# - roles/run.admin
# - roles/artifactregistry.writer
# - roles/iam.serviceAccountUser
```

### Issue: Health check fails
```bash
# Check if service is running
gcloud run services describe fincore-webui-npe --region=europe-west2

# View logs
gcloud run services logs read fincore-webui-npe --region=europe-west2 --limit=100

# Test locally
docker run -p 8080:8080 test:latest
curl http://localhost:8080/health
```

### Issue: API calls fail (CORS errors)
The backend API should have CORS configured. If not, check:
```bash
# Backend CORS configuration should allow frontend domain
# Check backend logs
gcloud run services logs read fincore-npe-api --region=europe-west2
```

---

## Rollback

If deployment has issues, rollback to previous version:

```bash
# List revisions
gcloud run revisions list --service=fincore-webui-npe --region=europe-west2

# Route traffic to previous revision
gcloud run services update-traffic fincore-webui-npe \
  --to-revisions=fincore-webui-npe-00001-abc=100 \
  --region=europe-west2
```

---

## Custom Domain (Optional)

To use a custom domain:

```bash
# Map domain to Cloud Run service
gcloud run domain-mappings create \
  --service=fincore-webui-npe \
  --domain=app.fincore.com \
  --region=europe-west2

# Follow DNS setup instructions
```

---

## Monitoring

### Cloud Run Dashboard
```
https://console.cloud.google.com/run/detail/europe-west2/fincore-webui-npe/metrics?project=project-07a61357-b791-4255-a9e
```

### Key Metrics to Monitor
- **Request Count**: Normal traffic patterns
- **Request Latency**: < 500ms for good UX
- **Error Rate**: < 1% target
- **Instance Count**: Scaling behavior
- **Memory Usage**: Should stay under 512Mi

---

## Security Checklist

- ✅ Service uses HTTPS (automatic with Cloud Run)
- ✅ API credentials not in code (uses environment variables)
- ✅ Service account has minimal required permissions
- ✅ Container runs as non-root user (nginx default)
- ✅ Security headers configured in nginx
- ✅ Static assets cached with immutable headers
- ⚠️ Service is public (no authentication required for UI)

---

## Support

**Issues?**
- GitHub Issues: https://github.com/kasisheraz/fincore_WebUI/issues
- Backend API: https://github.com/kasisheraz/userManagementApi

**Documentation:**
- [GCP_DEPLOYMENT_PLAN.md](GCP_DEPLOYMENT_PLAN.md) - Complete deployment guide
- [E2E_TESTING_GUIDE.md](E2E_TESTING_GUIDE.md) - Testing documentation
- [QUICK_START.md](QUICK_START.md) - Local development guide

---

**Last Updated**: March 6, 2026  
**Project**: FinCore WebUI  
**GCP Project**: project-07a61357-b791-4255-a9e  
**Region**: europe-west2  
**Status**: ✅ Ready to Deploy
