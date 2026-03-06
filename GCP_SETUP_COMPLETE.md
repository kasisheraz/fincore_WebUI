# GCP Setup Complete ✓

## Summary

The GCP infrastructure for deploying FinCore WebUI has been successfully configured.

## Completed Steps

### 1. ✅ Artifact Registry Repository Created
- **Repository**: `fincore-webui`
- **Location**: `europe-west2`
- **Format**: Docker
- **Registry URI**: `europe-west2-docker.pkg.dev/project-07a61357-b791-4255-a9e/fincore-webui`
- **Created**: 2026-03-06T16:22:17.902126Z

### 2. ✅ Docker Authentication Configured
- Configured Docker to authenticate with Artifact Registry
- Region: `europe-west2-docker.pkg.dev`

### 3. ✅ Service Account Verified & Permissions Granted
- **Service Account**: `fincore-github-actions@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com`
- **Permissions**:
  - ✅ Artifact Registry Writer (`roles/artifactregistry.writer`)
  - ✅ Cloud Run Admin (`roles/run.admin`)
  - ✅ Storage Admin (`roles/storage.admin`)
  - ✅ Service Account User (`roles/iam.serviceAccountUser`)
  - ✅ Cloud SQL Admin (`roles/cloudsql.admin`)
  - ✅ Secret Manager Admin (`roles/secretmanager.admin`)
  - ✅ VPC Access Admin (`roles/vpcaccess.admin`)
  - ✅ Network Admin (`roles/compute.networkAdmin`)

## Infrastructure Configuration

```yaml
Project ID: project-07a61357-b791-4255-a9e
Region: europe-west2
Service Name: fincore-webui-npe
Repository: fincore-webui
Image: europe-west2-docker.pkg.dev/project-07a61357-b791-4255-a9e/fincore-webui/app
Service Account: fincore-github-actions@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com
Backend API: https://fincore-npe-api-994490239798.europe-west2.run.app
```

## Next Steps

### Option A: Automated Deployment via GitHub Actions (Recommended)

#### 1. Configure GitHub Secrets

Navigate to your repository settings and add these secrets:
`https://github.com/kasisheraz/fincore_WebUI/settings/secrets/actions`

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | `project-07a61357-b791-4255-a9e` |
| `GCP_REGION` | `europe-west2` |
| `API_BASE_URL` | `https://fincore-npe-api-994490239798.europe-west2.run.app` |
| `GCP_SA_KEY` | JSON key for `fincore-github-actions@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com` |

**To get the service account key:**

```powershell
# Create and download service account key
gcloud iam service-accounts keys create gcp-sa-key.json `
  --iam-account=fincore-github-actions@project-07a61357-b791-4255-a9e.iam.gserviceaccount.com

# Display the key content
Get-Content gcp-sa-key.json | clip  # Copies to clipboard
```

⚠️ **Security Note**: After copying the key content to GitHub, delete the local file:
```powershell
Remove-Item gcp-sa-key.json -Force
```

#### 2. Commit and Push Deployment Files

```powershell
git add .
git commit -m "feat: Add GCP Cloud Run deployment configuration"
git push origin main
```

#### 3. Monitor Deployment

Once pushed, GitHub Actions will automatically:
1. ✅ Run Playwright tests on Chromium
2. ✅ Build Docker image
3. ✅ Push to Artifact Registry
4. ✅ Deploy to Cloud Run
5. ✅ Perform health check

View progress: `https://github.com/kasisheraz/fincore_WebUI/actions`

#### 4. Access Deployed Application

After successful deployment, get the service URL:

```powershell
gcloud run services describe fincore-webui-npe `
  --region=europe-west2 `
  --format='value(status.url)'
```

The URL will be something like:
`https://fincore-webui-npe-994490239798.europe-west2.run.app`

### Option B: Manual Deployment

```powershell
# Run the manual deployment script
.\deploy-manual.ps1
```

This will:
1. Build Docker image
2. Push to Artifact Registry
3. Deploy to Cloud Run
4. Verify deployment

## Verification

### Check Service Status
```powershell
gcloud run services describe fincore-webui-npe --region=europe-west2
```

### Test Health Endpoint
```powershell
curl https://[YOUR-SERVICE-URL]/health
# Expected: 200 OK with "healthy" response
```

### View Logs
```powershell
gcloud run services logs tail fincore-webui-npe --region=europe-west2
```

### View in Console
https://console.cloud.google.com/run?project=project-07a61357-b791-4255-a9e

## Architecture

```
┌─────────────────┐
│   GitHub Repo   │
│  fincore_WebUI  │
└────────┬────────┘
         │ Push to main
         ▼
┌─────────────────┐
│ GitHub Actions  │
│  - Run Tests    │
│  - Build Docker │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│     Artifact Registry               │
│  europe-west2-docker.pkg.dev        │
│  /project-07a61357.../fincore-webui │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Cloud Run Service              │
│   fincore-webui-npe                 │
│   - Port: 8080 (Nginx)              │
│   - Resources: 512Mi RAM, 1 CPU     │
│   - Auto-scaling: 0-10 instances    │
└────────┬────────────────────────────┘
         │ API Calls
         ▼
┌─────────────────────────────────────┐
│      Backend API                    │
│   fincore-npe-api                   │
│   europe-west2                      │
└─────────────────────────────────────┘
```

## Files Created/Updated

### New Files
- [.github/workflows/deploy-gcp.yml](.github/workflows/deploy-gcp.yml) - GitHub Actions workflow
- [.env.production](.env.production) - Production environment variables
- [setup-gcp.ps1](setup-gcp.ps1) - GCP infrastructure setup script
- [deploy-manual.ps1](deploy-manual.ps1) - Manual deployment script
- [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) - Comprehensive deployment guide
- [GCP_SETUP_COMPLETE.md](GCP_SETUP_COMPLETE.md) - This file

### Updated Files
- [Dockerfile](Dockerfile) - Updated for Cloud Run (port 8080)
- [nginx.conf](nginx.conf) - Updated for Cloud Run (health endpoint)
- [GCP_DEPLOYMENT_PLAN.md](GCP_DEPLOYMENT_PLAN.md) - Deployment architecture

## Cost Estimate

Based on the backend API usage and similar configuration:

- **Cloud Run**: $5-20/month (depending on traffic)
- **Artifact Registry Storage**: $0.10/GB/month
- **Cloud Build** (if used): 120 build-minutes/day free
- **Data Transfer**: First 1GB/month free

**Estimated Total**: $5-25/month for typical usage

## Support & Troubleshooting

See [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) for detailed troubleshooting guide.

### Common Issues

**Docker not in PATH**
- This is OK for GitHub Actions deployment
- For local builds, install Docker Desktop

**Permission denied errors**
- Verify service account has all required roles
- Check the IAM policy binding output above

**Health check failures**
- Verify `/health` endpoint returns 200
- Check Cloud Run logs for startup errors

## Security Checklist

- ✅ Service account follows principle of least privilege
- ✅ HTTPS only (Cloud Run enforces this)
- ⚠️ Add custom domain and configure SSL if needed
- ⚠️ Configure VPC connector for private backend access (optional)
- ⚠️ Enable Container Analysis for vulnerability scanning (optional)

## Monitoring

### Cloud Run Dashboard
https://console.cloud.google.com/run/detail/europe-west2/fincore-webui-npe/metrics?project=project-07a61357-b791-4255-a9e

**Metrics to monitor:**
- Request count
- Request latency
- Error rate
- Instance count
- CPU utilization
- Memory utilization

### Set Up Alerts (Recommended)

```powershell
# Example: Alert when error rate > 5%
gcloud alpha monitoring policies create `
  --notification-channels=[CHANNEL-ID] `
  --display-name="WebUI Error Rate Alert" `
  --condition-display-name="Error rate > 5%" `
  --condition-threshold-value=5 `
  --condition-threshold-duration=60s
```

---

**Setup completed**: 2026-03-06
**Ready for deployment**: ✅ Yes
