# Setup Instructions for Confluence Automation

**Complete setup guide for automating documentation updates**

---

## 📋 Overview

This guide will help you set up automatic Confluence documentation updates for all three Fincore repositories.

**Time Required**: 20-30 minutes  
**Repositories**: fincore_WebUI, userManagementApi, fincore_Iasc

---

## Step 1: Create Atlassian API Token (5 minutes)

### 1.1 Generate API Token

1. Go to: **https://id.atlassian.com/manage-profile/security/api-tokens**
2. Click **"Create API token"**
3. Name it: `fincore-github-automation`
4. Click **"Create"**
5. **Copy the token** (you won't see it again!)

### 1.2 Find Your Confluence Details

1. **Confluence URL**: Your base URL (e.g., `https://fincoredesign.atlassian.net/wiki`)
2. **Email**: The email address you use to log into Confluence
3. **Space Key**: 
   - Go to your Confluence space
   - Look at the URL: `/wiki/spaces/**FINCORE**/...`
   - The space key is the part between `spaces/` and the next `/`

**Save these values** - you'll need them in the next step:
```
CONFLUENCE_URL=https://fincoredesign.atlassian.net/wiki
CONFLUENCE_USER=your-email@example.com
CONFLUENCE_API_TOKEN=<the-token-you-just-created>
CONFLUENCE_SPACE_KEY=FINCORE
```

---

## Step 2: Add GitHub Secrets (10 minutes)

Add the secrets to **all three repositories**.

### 2.1 For fincore_WebUI

1. Go to: **https://github.com/kasisheraz/fincore_WebUI/settings/secrets/actions**
2. Click **"New repository secret"**
3. Add these four secrets one by one:

| Name | Value |
|------|-------|
| `CONFLUENCE_URL` | `https://fincoredesign.atlassian.net/wiki` |
| `CONFLUENCE_USER` | Your email address |
| `CONFLUENCE_API_TOKEN` | The API token from Step 1 |
| `CONFLUENCE_SPACE_KEY` | `FINCORE` |

### 2.2 For userManagementApi

Repeat the same process:
1. Go to: **https://github.com/kasisheraz/userManagementApi/settings/secrets/actions**
2. Add the same four secrets

### 2.3 For fincore_Iasc

Repeat one more time:
1. Go to: **https://github.com/kasisheraz/fincore_Iasc/settings/secrets/actions**  
2. Add the same four secrets

**✅ Verification**: You should see 4 secrets in each repository's secrets page.

---

## Step 3: Create Confluence Space (5 minutes)

### 3.1 Create Space (if not exists)

1. Go to: **https://fincoredesign.atlassian.net/wiki**
2. Click **"Create space"**
3. Choose **"Blank space"**
4. Fill in:
   - **Name**: `Fincore Platform`
   - **Key**: `FINCORE`
   - **Description**: `Complete documentation for Fincore financial platform`
5. Click **"Create"**

### 3.2 Create Parent Page

1. In your new space, click **"Create"** (top right)
2. Title: `Fincore Platform`
3. Add brief description:
   ```
   This space contains comprehensive documentation for the Fincore platform,
   including architecture, API documentation, deployment guides, and more.
   
   All documentation is automatically synchronized from our GitHub repositories.
   ```
4. Click **"Publish"**

---

## Step 4: Commit Automation Files (5 minutes)

### 4.1 For fincore_WebUI

The files are already created! Just commit and push them:

```powershell
cd C:\Development\git\fincore_WebUI

# Add all automation files
git add .github/scripts/
git add .github/workflows/update-confluence.yml
git add confluence/
git add CONFLUENCE_AUTOMATION_PLAN.md

# Commit
git commit -m "feat: Add Confluence automation

- Add update-confluence.js script for API integration
- Add generate-test-report.js for test metrics
- Create update-confluence.yml workflow
- Add comprehensive Confluence documentation pages
- Automatic updates on every push to main"

# Push to your feature branch or main
git push origin HEAD
```

### 4.2 For userManagementApi

Copy files from fincore_WebUI:

```powershell
cd C:\Development\git\userManagementApi

# Copy automation scripts
mkdir .github\scripts -Force
copy ..\fincore_WebUI\.github\scripts\update-confluence.js .\.github\scripts\
copy ..\fincore_WebUI\.github\scripts\generate-test-report.js .\.github\scripts\

# Copy workflow
mkdir .github\workflows -Force
copy ..\fincore_WebUI\.github\workflows\update-confluence.yml .\.github\workflows\

# Create confluence directory with backend-specific docs
mkdir confluence -Force

# Commit
git add .github/
git add confluence/
git commit -m "feat: Add Confluence automation for backend API"
git push origin HEAD
```

### 4.3 For fincore_Iasc

```powershell
cd C:\Development\git\fincore_Iasc

# Copy automation files
mkdir .github\scripts -Force
copy ..\fincore_WebUI\.github\scripts\update-confluence.js .\.github\scripts\

mkdir .github\workflows -Force
copy ..\fincore_WebUI\.github\workflows\update-confluence.yml .\.github\workflows\

# Create confluence directory
mkdir confluence -Force

# Commit
git add .github/
git add confluence/
git commit -m "feat: Add Confluence automation for infrastructure"
git push origin HEAD
```

---

## Step 5: Test the Automation (5 minutes)

### 5.1 Trigger Manual Run

1. Go to: **https://github.com/kasisheraz/fincore_WebUI/actions**
2. Click on **"Update Confluence Documentation"** workflow
3. Click **"Run workflow"** button
4. Select branch: `main`
5. Click **"Run workflow"**

### 5.2 Monitor Execution

1. Watch the workflow run (takes ~2-3 minutes)
2. Check for ✅ green checkmark
3. If ❌ red X, click on the run to see error logs

### 5.3 Verify in Confluence

1. Go to: **https://fincoredesign.atlassian.net/wiki/spaces/FINCORE**
2. You should see new child pages under "Fincore Platform":
   - Platform Overview
   - Architecture
   - Getting Started
   - Development Guide
   - Testing Guide
   - API Documentation
   - Deployment Guide
   - Troubleshooting

**✅ Success!** Your documentation is now in Confluence.

---

## Step 6: Configure Automatic Updates

### 6.1 Understand Triggers

The automation runs automatically when:
- ✅ Code is pushed to `main` branch
- ✅ Changes are made to `src/` files
- ✅ Changes are made to `confluence/` files
- ✅ Changes are made to `README.md`
- ✅ Workflows are updated

### 6.2 Test Automatic Trigger

Make a small change:

```powershell
cd C:\Development\git\fincore_WebUI

# Update a documentation file
echo "`n`n**Test Update**: $(Get-Date)" >> confluence\01-PLATFORM-OVERVIEW.md

# Commit and push
git add confluence\01-PLATFORM-OVERVIEW.md
git commit -m "docs: Test automatic Confluence update"
git push origin main
```

Wait 2-3 minutes, then check Confluence - the page should be updated!

---

## 🎯 What Happens Now?

### Automatic Process

Every time you push to `main`:

1. **GitHub Actions triggers**
2. **Scripts run** to generate fresh documentation
3. **Confluence API** is called to update pages
4. **Pages are updated** in Confluence
5. **You get notified** (via GitHub Actions)

### Manual Updates

You can also manually update docs:

```powershell
# Edit markdown files
notepad confluence\01-PLATFORM-OVERVIEW.md

# Commit changes
git add confluence\
git commit -m "docs: Update architecture diagram"
git push origin main

# Confluence updates automatically in 2-3 minutes!
```

---

## 🔧 Customization

### Adding New Pages

1. Create new markdown file in `confluence/` directory:
   ```powershell
   New-Item confluence\09-SECURITY-GUIDE.md
   ```

2. Add to `update-confluence.js` in the `docFiles` array:
   ```javascript
   { file: 'confluence/09-SECURITY-GUIDE.md', title: 'Security Guide' }
   ```

3. Commit and push - new page appears in Confluence!

### Changing Update Frequency

Edit `.github/workflows/update-confluence.yml`:

```yaml
on:
  push:
    branches: [main]
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
```

### Adding Notifications

Add Slack notification to workflow:

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "📚 Confluence documentation updated successfully!"
      }
```

---

## 🐛 Troubleshooting

### Error: "Authentication failed"

**Cause**: Invalid API token or email

**Fix**:
1. Regenerate API token
2. Update `CONFLUENCE_API_TOKEN` secret
3. Verify `CONFLUENCE_USER` matches your Atlassian email

### Error: "Page not found"

**Cause**: Space key is incorrect

**Fix**:
1. Check your Confluence space URL
2. Update `CONFLUENCE_SPACE_KEY` secret
3. Ensure space exists

### Error: "Permission denied"

**Cause**: Your account doesn't have write permission

**Fix**:
1. Ask Confluence admin to grant you write access
2. Or use admin account API token

### Workflow Doesn't Trigger

**Cause**: Push to wrong branch or path not matched

**Fix**:
1. Ensure pushing to `main` branch
2. Check workflow `paths:` matches your changes
3. Manually trigger: Actions → Run workflow

---

## 📊 Monitoring

### View Update History

1. **GitHub Actions**: See all runs at `/actions`
2. **Confluence**: Check page history (click ⋯ → Page History)
3. **Git**: `git log confluence/` to see doc changes

### Success Metrics

- ✅ Zero manual copy/paste needed
- ✅ Documentation always up-to-date
- ✅ Single source of truth (Git)
- ✅ Full audit trail

---

## ✅ Setup Complete!

Congratulations! Your Confluence automation is now active.

### What You've Achieved

- ✅ Automatic documentation updates
- ✅ No manual copy/paste needed
- ✅ Documentation in version control
- ✅ Full audit trail
- ✅ Team can contribute easily

### Next Steps

1. **Add more documentation**: Create new markdown files
2. **Customize workflows**: Add notifications, schedules
3. **Set up for other repos**: Repeat for userManagementApi and fincore_Iasc
4. **Train team**: Share this guide with team members

---

## 🆘 Need Help?

- **Issues**: Check GitHub Actions logs
- **Questions**: Review [CONFLUENCE_AUTOMATION_PLAN.md](../CONFLUENCE_AUTOMATION_PLAN.md)
- **Bugs**: Create issue on GitHub

---

**Setup Time**: ~20-30 minutes  
**Maintenance**: ~0 minutes (fully automated!)  
**ROI**: Infinite (saves hours every week)

---

**Last Updated**: March 16, 2026
