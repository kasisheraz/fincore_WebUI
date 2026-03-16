# Branch Protection Setup Guide

**Repository**: fincore_WebUI & userManagementApi  
**Date**: March 16, 2026  
**Purpose**: Configure GitHub branch protection rules to enforce quality gates

---

## Overview

This guide walks you through setting up branch protection rules on GitHub to ensure:
- ✅ No direct commits to main branch
- ✅ All changes go through Pull Requests
- ✅ Tests must pass before merge
- ✅ Code review required
- ✅ Conversations must be resolved

---

## Prerequisites

- ✅ Repository admin access
- ✅ CI/CD workflows enabled (deploy-gcp.yml, deploy-npe.yml, test.yml)
- ✅ Tests passing in CI/CD

---

## Part 1: Frontend (fincore_WebUI)

### Step 1: Navigate to Branch Protection Settings

1. Go to: https://github.com/kasisheraz/fincore_WebUI
2. Click: **Settings** (tab at top)
3. In left sidebar, click: **Branches**
4. Under "Branch protection rules", click: **Add rule**

### Step 2: Configure Main Branch Protection

**Branch name pattern**: `main`

#### ✅ Section 1: Protect matching branches

**Enable these checkboxes**:

```
☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☐ Require review from Code Owners (optional)

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  
  Status checks found in the last week for this repository:
  Search for: "test"
  ☑ test (from deploy-gcp.yml)

☑ Require conversation resolution before merging

☐ Require signed commits (optional)

☐ Require linear history (optional)

☑ Do not allow bypassing the above settings
  ☐ Allow specified actors to bypass required pull requests
  (Keep this unchecked to enforce for everyone)
```

#### Notes:
- **"Require approvals: 1"** means one team member must review and approve the PR
- **"Status checks: test"** is the job name from `.github/workflows/deploy-gcp.yml`
- **"Require branches to be up to date"** ensures the PR has latest changes from main

### Step 3: Save Changes

1. Scroll to bottom
2. Click: **Create** (or **Save changes** if editing existing rule)
3. Confirm the rule is now listed under "Branch protection rules"

### Step 4: Verify Configuration

**Test the protection**:
```bash
# Try to push directly to main (should be rejected)
git checkout main
git commit --allow-empty -m "test: direct commit"
git push origin main

# Expected result:
# remote: error: GH006: Protected branch update failed
# This is correct! Direct pushes are blocked.
```

**Proper workflow**:
```bash
# Create feature branch
git checkout -b feature/my-changes

# Make changes and commit
git add .
git commit -m "feat: my new feature"

# Push to feature branch
git push origin feature/my-changes

# Create PR on GitHub
# Tests will run automatically
# Get code review approval
# Merge when tests pass ✅
```

---

## Part 2: Backend (userManagementApi)

### Step 1: Navigate to Branch Protection Settings

1. Go to: https://github.com/kasisheraz/userManagementApi
2. Click: **Settings** (tab at top)
3. In left sidebar, click: **Branches**
4. Under "Branch protection rules", click: **Add rule**

### Step 2: Configure Main Branch Protection

**Branch name pattern**: `main`

#### ✅ Section 1: Protect matching branches

**Enable these checkboxes**:

```
☑ Require a pull request before merging
  ☑ Require approvals: 1
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☐ Require review from Code Owners (optional)

☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging
  
  Status checks found in the last week for this repository:
  Search for: "build"
  ☑ Build & Test (from deploy-npe.yml)
  
  Search for: "test"  
  ☑ Maven Test (from test.yml)

☑ Require conversation resolution before merging

☐ Require signed commits (optional)

☐ Require linear history (optional)

☑ Do not allow bypassing the above settings
  ☐ Allow specified actors to bypass required pull requests
  (Keep this unchecked to enforce for everyone)
```

#### Notes:
- **Two status checks required**:
  - "Build & Test" from deploy-npe.yml (runs on push to main)
  - "Maven Test" from test.yml (runs on pull requests)
- Both must pass before PR can be merged

### Step 3: Save Changes

1. Scroll to bottom
2. Click: **Create** (or **Save changes** if editing existing rule)
3. Confirm the rule is now listed under "Branch protection rules"

### Step 4: Verify Configuration

**Test the protection**:
```bash
# Try to push directly to main (should be rejected)
git checkout main
git commit --allow-empty -m "test: direct commit"
git push origin main

# Expected result:
# remote: error: GH006: Protected branch update failed
```

**Proper workflow**:
```bash
# Create feature branch
git checkout -b fix/some-bug

# Make changes and commit
git add .
git commit -m "fix: resolve issue with OTP service"

# Push to feature branch
git push origin fix/some-bug

# Create PR on GitHub
# Maven Test workflow runs (test.yml)
# Get code review approval
# Merge when tests pass ✅
# After merge, Build & Test runs (deploy-npe.yml)
# Automatic deployment to NPE 🚀
```

---

## Part 3: Advanced Configuration (Optional)

### Require Specific Reviewers

If you want to require reviews from specific team members:

1. In branch protection rule settings
2. Enable: **Require review from Code Owners**
3. Create file: `.github/CODEOWNERS` in repository root

**Example CODEOWNERS file**:
```
# Frontend code owners
*.tsx @frontend-lead @senior-dev
*.ts @frontend-lead @senior-dev
/src/components/ @ui-specialist

# Backend code owners
*.java @backend-lead @senior-dev
/src/main/java/service/ @backend-lead
/src/test/ @qa-lead

# DevOps files
/.github/ @devops-lead
Dockerfile @devops-lead
*.yml @devops-lead

# Database migrations
*.sql @database-admin @backend-lead
```

### Require Multiple Approvals

For critical repositories, require 2+ approvals:

1. In branch protection settings
2. Change: **Require approvals: 2**
3. Enable: **Require review from Code Owners**

### Enable Auto-delete of Branches

Clean up merged branches automatically:

1. Go to: **Settings** → **General**
2. Scroll to: "Pull Requests"
3. Enable: **Automatically delete head branches**

---

## Part 4: Status Check Configuration Reference

### Finding Status Check Names

Status checks are the job names from your workflow files:

**Frontend (.github/workflows/deploy-gcp.yml)**:
```yaml
jobs:
  test:  # ← This becomes "test" status check
    name: Run Tests
    
  build-and-deploy:  # ← This becomes "build-and-deploy" status check
    name: Build and Deploy to Cloud Run
```

**Backend (.github/workflows/deploy-npe.yml)**:
```yaml
jobs:
  build:  # ← This becomes "build" status check
    name: Build & Test
    
  docker-build-push:  # ← This becomes "docker-build-push" status check
  
  deploy-npe:  # ← This becomes "deploy-npe" status check
```

**Backend (.github/workflows/test.yml)**:
```yaml
jobs:
  test:  # ← This becomes "test" status check
    name: Maven Test
```

### Recommended Status Checks

**Frontend**: Require these checks
- ✅ `test` (from deploy-gcp.yml) - E2E tests must pass

**Backend**: Require these checks
- ✅ `build` (from deploy-npe.yml) - Unit tests must pass
- ✅ `test` (from test.yml) - PR tests must pass

---

## Part 5: Troubleshooting

### Problem: Status checks not appearing

**Causes**:
- Workflows haven't run yet on main branch
- Status check names don't match job names
- Workflows are disabled

**Solutions**:
```bash
# Trigger a workflow run
git checkout main
git commit --allow-empty -m "chore: trigger CI"
git push origin main

# Wait for workflows to complete
# Then status checks will appear in branch protection settings
```

### Problem: Can't find "Require status checks" option

**Cause**: No workflows have run in the past week

**Solution**:
1. Run workflows first (push to main)
2. Wait for completion
3. Refresh branch protection settings page
4. Status checks should now appear

### Problem: Admin can't bypass protection

**Cause**: "Do not allow bypassing" is enabled

**Solution**:
1. Edit branch protection rule
2. Under "Do not allow bypassing the above settings"
3. Enable: "Allow specified actors to bypass"
4. Add administrators to the list
5. This allows emergency hotfixes but logs the bypass

### Problem: PR can't be merged despite passing tests

**Causes**:
- Conversations not resolved
- Branch not up to date with main
- Approval missing

**Solutions**:
```bash
# Resolve all conversations in PR

# Update branch with latest main
git checkout main
git pull origin main
git checkout your-feature-branch
git merge main
git push origin your-feature-branch

# Request approval from reviewer
```

---

## Part 6: Testing the Setup

### Test 1: Direct Push (Should Fail)

```bash
git checkout main
echo "test" >> README.md
git add README.md
git commit -m "test: direct commit"
git push origin main

# ❌ Expected: remote: error: GH006: Protected branch update failed
# ✅ Result: Direct push is blocked!
```

### Test 2: PR Without Tests (Should Fail)

```bash
# Create branch
git checkout -b test/without-tests

# Break a test intentionally
# Edit a test file to cause failure

# Commit and push
git add .
git commit -m "test: breaking tests"
git push origin test/without-tests

# Create PR on GitHub
# ❌ Status check "test" will fail
# ✅ Result: Merge button is disabled!
```

### Test 3: PR Without Approval (Should Fail)

```bash
# Create branch
git checkout -b test/needs-approval

# Make valid change
echo "# Test" >> docs/test.md

# Commit and push
git add .
git commit -m "docs: add test file"
git push origin test/needs-approval

# Create PR on GitHub
# ✅ Status checks pass (tests pass)
# ❌ No approval yet
# ✅ Result: Merge button is disabled!
# ✅ After approval: Merge button is enabled!
```

### Test 4: Valid PR (Should Succeed)

```bash
# Create branch
git checkout -b feature/valid-change

# Make valid change
echo "# Feature" >> docs/feature.md

# Commit and push
git add .
git commit -m "feat: add feature documentation"
git push origin feature/valid-change

# Create PR on GitHub
# ✅ Status checks pass (tests pass)
# ✅ Get approval from reviewer
# ✅ Resolve any conversations
# ✅ Branch is up to date
# ✅ Result: Merge button is enabled!
# ✅ Click "Squash and merge"
# ✅ Deployment starts automatically
```

---

## Part 7: Maintenance

### Regular Reviews

**Monthly**:
- Review branch protection rules
- Check if all required checks are still valid
- Update check list if workflows changed
- Ensure team knows the process

**After Major Changes**:
- Update branch protection if new workflows added
- Add new status checks if needed
- Update documentation
- Notify team of changes

### Audit Logs

**View who bypassed protection**:
1. Go to: **Settings** → **Security** → **Audit log**
2. Filter: "Protected branch policy"
3. Review bypass events
4. Ensure bypasses were legitimate

---

## Part 8: Quick Reference

### ✅ What's Protected Now

**Frontend (fincore_WebUI)**:
- ✅ No direct pushes to main
- ✅ E2E tests must pass (136/136)
- ✅ 1 approval required
- ✅ Conversations must be resolved

**Backend (userManagementApi)**:
- ✅ No direct pushes to main
- ✅ Unit tests must pass (602/661 minimum)
- ✅ PR tests must pass
- ✅ 1 approval required
- ✅ Conversations must be resolved

### 📋 Developer Checklist

Before creating PR:
- [ ] Code committed to feature branch
- [ ] Tests pass locally
- [ ] Code follows conventions
- [ ] Documentation updated

During PR review:
- [ ] All CI checks green
- [ ] No merge conflicts
- [ ] Reviewer assigned
- [ ] All conversations resolved
- [ ] Approval received

After merge:
- [ ] Branch auto-deleted (if configured)
- [ ] Deployment succeeded
- [ ] NPE environment verified

---

## Summary

### What You Need to Do

1. **Frontend Repository**:
   - Go to: https://github.com/kasisheraz/fincore_WebUI/settings/branches
   - Add protection rule for `main` branch
   - Require status check: `test`
   - Require 1 approval
   - Save changes

2. **Backend Repository**:
   - Go to: https://github.com/kasisheraz/userManagementApi/settings/branches
   - Add protection rule for `main` branch
   - Require status checks: `build`, `test`
   - Require 1 approval
   - Save changes

3. **Verify**:
   - Try direct push to main (should fail)
   - Create test PR
   - Confirm tests run automatically
   - Confirm merge button disabled until checks pass
   - Get approval and merge

4. **Document**:
   - Update team wiki/documentation
   - Notify team of new process
   - Provide training if needed

---

**Setup Time**: ~15 minutes per repository  
**Effect**: Immediate - All new pushes/PRs will be protected  
**Maintenance**: Review quarterly or after workflow changes

**Need Help?**
- GitHub Docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- Contact: DevOps team
