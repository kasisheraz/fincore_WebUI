# GitHub Secrets Setup - Action Required

## ✅ What's Done

1. ✅ Service account key created and copied to your clipboard
2. ✅ Deployment files committed and pushed to GitHub
3. ✅ Key file deleted from local disk for security

## 🔑 Add GitHub Secrets (Required)

**You need to add 4 secrets to enable automated deployment.**

### Step 1: Go to GitHub Secrets Page

Open this URL in your browser:
```
https://github.com/kasisheraz/fincore_WebUI/settings/secrets/actions
```

### Step 2: Click "New repository secret" for each secret below

### Secret 1: GCP_SA_KEY
- **Name**: `GCP_SA_KEY`
- **Value**: **Paste from clipboard** (service account key JSON - already copied!)
- The key should look like:
  ```json
  {
    "type": "service_account",
    "project_id": "project-07a61357-b791-4255-a9e",
    "private_key_id": "...",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...",
    ...
  }
  ```

### Secret 2: GCP_PROJECT_ID
- **Name**: `GCP_PROJECT_ID`
- **Value**: `project-07a61357-b791-4255-a9e`

### Secret 3: GCP_REGION
- **Name**: `GCP_REGION`
- **Value**: `europe-west2`

### Secret 4: API_BASE_URL
- **Name**: `API_BASE_URL`
- **Value**: `https://fincore-npe-api-994490239798.europe-west2.run.app`

## 📋 Quick Checklist

- [ ] Open GitHub Secrets page
- [ ] Add `GCP_SA_KEY` (paste from clipboard)
- [ ] Add `GCP_PROJECT_ID`
- [ ] Add `GCP_REGION`
- [ ] Add `API_BASE_URL`
- [ ] Check GitHub Actions

## 🚀 What Happens Next

Once you add the secrets:

1. **Manual Trigger** (Optional):
   - Go to: https://github.com/kasisheraz/fincore_WebUI/actions
   - Select "Deploy to GCP Cloud Run" workflow
   - Click "Run workflow" → "Run workflow"

2. **Automatic Trigger**:
   - Any future push to `main` branch will automatically deploy
   - Tests will run first, then deployment if tests pass

## 📊 Monitor Deployment

### GitHub Actions
https://github.com/kasisheraz/fincore_WebUI/actions

You'll see:
- ✅ Test job running Playwright tests
- ✅ Build-and-deploy job pushing to GCP

### Expected Timeline
- Tests: ~3-5 minutes
- Build: ~2-3 minutes
- Deploy: ~2-3 minutes
- **Total**: ~7-11 minutes

## 🔍 After Deployment

### Get Service URL
```powershell
gcloud run services describe fincore-webui-npe --region=europe-west2 --format='value(status.url)'
```

### Test Deployment
```powershell
# Health check
curl $(gcloud run services describe fincore-webui-npe --region=europe-west2 --format='value(status.url)')/health

# Open in browser
start $(gcloud run services describe fincore-webui-npe --region=europe-west2 --format='value(status.url)')
```

### View Logs
```powershell
gcloud run services logs tail fincore-webui-npe --region=europe-west2
```

## 🔐 Security Notes

- ✅ Service account key deleted from local disk
- ✅ Key added to .gitignore to prevent future commits
- ⚠️ Never commit service account keys to Git
- ⚠️ GitHub Secrets are encrypted and only accessible to authorized workflows

## ❓ Troubleshooting

### If GitHub Actions fails:

**"Error: Invalid credentials"**
- Check that `GCP_SA_KEY` is the complete JSON (including outer braces)
- Verify no extra spaces or line breaks

**"Error: Permission denied"**
- Service account already has all necessary permissions
- Try re-running the workflow

**"Tests failed"**
- Playwright tests must pass before deployment
- Check test logs in GitHub Actions
- Fix any failing tests and push again

**"Docker build failed"**
- Check Dockerfile syntax
- Verify all dependencies in package.json

### Need Help?

See detailed troubleshooting: [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md)

## 📞 Quick Reference

| Resource | Link |
|----------|------|
| GitHub Actions | https://github.com/kasisheraz/fincore_WebUI/actions |
| Add Secrets | https://github.com/kasisheraz/fincore_WebUI/settings/secrets/actions |
| Cloud Run Console | https://console.cloud.google.com/run?project=project-07a61357-b791-4255-a9e |
| Artifact Registry | https://console.cloud.google.com/artifacts/docker/project-07a61357-b791-4255-a9e/europe-west2/fincore-webui |

---

**Next Step**: Add the 4 GitHub Secrets using the link above, then monitor deployment! 🚀
