# Branch Protection Setup - Step-by-Step Guide

**Date**: March 16, 2026  
**Repositories**: fincore_WebUI (UI), userManagementApi (Backend), Infrastructure

---

## 📋 Quick Overview

You'll be setting up branch protection for 3 repositories. Each takes about 5 minutes.

**What you'll configure**:
- ✅ No direct pushes to `main` branch
- ✅ All changes must go through Pull Requests
- ✅ Tests must pass before merge
- ✅ At least 1 code review approval required
- ✅ All conversations must be resolved

---

## Part 1: UI Repository (fincore_WebUI)

### Step 1: Open Branch Protection Settings

1. **Open your browser** and go to:
   ```
   https://github.com/kasisheraz/fincore_WebUI/settings/branches
   ```

2. **If you see "404 Not Found"**: You don't have admin access. Contact the repository owner.

3. **You should see**: A page titled "Branches" with a section "Branch protection rules"

### Step 2: Add Protection Rule

1. **Click the button**: "Add rule" (green button on the right)

2. **In "Branch name pattern"**: Type `main`

### Step 3: Configure Protection Settings

**Scroll down and check these boxes** (✅ = check, ☐ = leave unchecked):

#### Section: "Protect matching branches"

```
✅ Require a pull request before merging
   ✅ Require approvals: [1]  (type "1" in the box)
   ✅ Dismiss stale pull request approvals when new commits are pushed
   ☐ Require review from Code Owners (leave unchecked for now)

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   
   In the search box below, type: test
   Click on: ✅ test
   
   (This is the E2E test job from your workflow)

✅ Require conversation resolution before merging

☐ Require signed commits (optional - leave unchecked)

☐ Require linear history (optional - leave unchecked)

☐ Require deployments to succeed before merging (leave unchecked)

☐ Lock branch (leave unchecked)

☐ Do not allow bypassing the above settings
   (Leave unchecked so admins can bypass in emergencies)
```

### Step 4: Save the Rule

1. **Scroll to the bottom** of the page

2. **Click**: "Create" (green button)

3. **You should see**: A success message and your rule listed under "Branch protection rules"

### Step 5: Verify It Works

Open PowerShell and run:

```powershell
cd C:\Development\git\fincore_WebUI
git checkout main
git pull origin main

# Try to push directly (this should FAIL - that's good!)
git commit --allow-empty -m "test: verify protection"
git push origin main
```

**Expected result**:
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: At least 1 approving review is required by reviewers with write access.
```

✅ **If you see this error, protection is working!**

---

## Part 2: Backend Repository (userManagementApi)

### Step 1: Open Branch Protection Settings

1. **Open your browser** and go to:
   ```
   https://github.com/kasisheraz/userManagementApi/settings/branches
   ```

2. **Click**: "Add rule" (green button)

3. **In "Branch name pattern"**: Type `main`

### Step 2: Configure Protection Settings

**Check these boxes**:

```
✅ Require a pull request before merging
   ✅ Require approvals: [1]
   ✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   
   In the search box, type: build
   Click on: ✅ Build & Test
   
   In the search box, type: test
   Click on: ✅ Maven Test
   
   (You need BOTH checks - build runs on main push, test runs on PRs)

✅ Require conversation resolution before merging

☐ Leave all other options unchecked
```

### Step 3: Save and Verify

1. **Click**: "Create"

2. **Verify with PowerShell**:

```powershell
cd C:\Development\git\userManagementApi
git checkout main
git pull origin main

# Try to push directly (should FAIL)
git commit --allow-empty -m "test: verify protection"
git push origin main
```

**Expected**: Error message about protected branch ✅

---

## Part 3: Infrastructure Repository

### Step 1: Identify Your Infrastructure Repo

**Common names**:
- `fincore-infrastructure`
- `fincore-iac` (Infrastructure as Code)
- `fincore-terraform`
- `fincore-devops`

**Find it**:
1. Go to: https://github.com/kasisheraz
2. Look for a repository with infrastructure/terraform/deployment config files
3. Note the exact repository name

### Step 2: Open Branch Protection Settings

**Replace `REPO_NAME` with your actual repository name**:

```
https://github.com/kasisheraz/REPO_NAME/settings/branches
```

### Step 3: Configure Protection Settings

**For infrastructure repos, use stricter rules**:

```
✅ Require a pull request before merging
   ✅ Require approvals: [2]  (TWO approvals for infrastructure!)
   ✅ Dismiss stale pull request approvals when new commits are pushed
   ✅ Require review from Code Owners (if you have a CODEOWNERS file)

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   
   Search and add any CI checks that exist:
   - Terraform validation
   - Security scanning
   - Lint checks
   
   (If no checks exist, you can skip this for now)

✅ Require conversation resolution before merging

✅ Require signed commits (OPTIONAL but recommended for infrastructure)

☐ Require linear history (optional)

☐ Do not allow bypassing the above settings
   ☐ Allow specified actors to bypass
      Add your DevOps lead's GitHub username
```

### Step 4: Save and Verify

1. **Click**: "Create"

2. **Verify**: Try to push directly to main (should fail)

---

## Part 4: Understanding the Protection Rules

### What Each Setting Does

#### 1. "Require a pull request before merging"
- **What it does**: You can't push directly to `main` branch
- **Why**: All changes must be reviewed
- **Effect**: `git push origin main` will fail

#### 2. "Require approvals: 1"
- **What it does**: At least 1 person must click "Approve" on the PR
- **Why**: Ensures code review
- **Effect**: Merge button disabled until approved

#### 3. "Dismiss stale approvals when new commits pushed"
- **What it does**: If you push new code, previous approvals are removed
- **Why**: New code needs new review
- **Effect**: Must get re-approved after changes

#### 4. "Require status checks to pass"
- **What it does**: CI tests must pass (green checkmark)
- **Why**: Prevents broken code from merging
- **Effect**: Merge button disabled if tests fail

#### 5. "Require branches to be up to date"
- **What it does**: Your branch must have latest changes from main
- **Why**: Prevents conflicts
- **Effect**: Must merge main into your branch before merging PR

#### 6. "Require conversation resolution"
- **What it does**: All review comments must be marked "Resolved"
- **Why**: Ensures feedback is addressed
- **Effect**: Merge button disabled if open conversations exist

---

## Part 5: Testing Your Setup

### Test 1: Direct Push (Should Fail ❌)

```powershell
# UI repo
cd C:\Development\git\fincore_WebUI
git checkout main
echo "test" >> test.txt
git add test.txt
git commit -m "test: direct push"
git push origin main

# Expected: ❌ remote: error: GH006: Protected branch update failed
# Result: ✅ Protection is working!
```

### Test 2: Create Valid PR (Should Work ✅)

```powershell
# UI repo
cd C:\Development\git\fincore_WebUI
git checkout -b test/branch-protection

# Make a small change
echo "# Test" >> docs/test.md
git add docs/test.md
git commit -m "docs: test branch protection"
git push origin test/branch-protection
```

**Then on GitHub**:
1. Go to your repository
2. Click "Pull requests" tab
3. Click "New pull request"
4. Base: `main`, Compare: `test/branch-protection`
5. Click "Create pull request"

**You should see**:
- ⏳ Status checks are running (yellow circle)
- ⚠️ "Merging is blocked" until checks pass and approval given
- ⏳ Waiting for status checks to complete

**After tests pass**:
- ✅ Status checks passed (green checkmark)
- ⚠️ "Merging is blocked" - needs approval

**After someone approves**:
- ✅ Status checks passed
- ✅ Approved by (username)
- ✅ "Merge pull request" button is GREEN and enabled!

### Test 3: Verify All 3 Repos

Run this script to verify all repositories:

```powershell
# Save this as test-branch-protection.ps1

Write-Host "Testing Branch Protection..." -ForegroundColor Cyan

# Test UI repo
Write-Host "`n1. Testing fincore_WebUI..." -ForegroundColor Yellow
cd C:\Development\git\fincore_WebUI
git checkout main
git pull origin main
git commit --allow-empty -m "test: verify protection"
$ui_result = git push origin main 2>&1
if ($ui_result -match "protected branch") {
    Write-Host "   ✅ UI protection working!" -ForegroundColor Green
} else {
    Write-Host "   ❌ UI protection NOT working!" -ForegroundColor Red
}

# Test Backend repo
Write-Host "`n2. Testing userManagementApi..." -ForegroundColor Yellow
cd C:\Development\git\userManagementApi
git checkout main
git pull origin main
git commit --allow-empty -m "test: verify protection"
$backend_result = git push origin main 2>&1
if ($backend_result -match "protected branch") {
    Write-Host "   ✅ Backend protection working!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend protection NOT working!" -ForegroundColor Red
}

Write-Host "`n3. Test Infrastructure repo manually" -ForegroundColor Yellow
Write-Host "   Navigate to your infrastructure repo and run:" -ForegroundColor Gray
Write-Host "   git commit --allow-empty -m 'test' && git push origin main" -ForegroundColor Gray

Write-Host "`n✅ Branch protection test complete!" -ForegroundColor Cyan
```

---

## Part 6: Common Issues & Solutions

### Issue 1: "404 Not Found" when accessing settings

**Problem**: You don't have admin access

**Solution**:
1. Ask repository owner to add you as admin
2. Go to: Repository → Settings → Collaborators
3. Add your username with "Admin" role

### Issue 2: Status checks not appearing

**Problem**: Workflows haven't run yet

**Solution**:
```powershell
# Trigger a workflow run
git checkout main
git commit --allow-empty -m "chore: trigger workflow"
git push origin main

# Wait 5 minutes for workflow to complete
# Then refresh the branch protection settings page
# Status checks should now appear in the dropdown
```

### Issue 3: Can't find the right status check

**Problem**: Multiple checks with similar names

**Solution**:
1. Go to: Repository → Actions tab
2. Click on latest workflow run
3. Look at the job names (e.g., "Build & Test", "test", "deploy")
4. Use EXACTLY those names in branch protection settings

### Issue 4: Want to bypass protection (emergency)

**Solution**:
1. Go to branch protection settings
2. Scroll to bottom
3. Uncheck "Do not allow bypassing"
4. Click "Save changes"
5. Admins can now bypass (but it's logged!)
6. **Remember to re-enable after emergency**

### Issue 5: Accidentally locked out of main branch

**Solution**:
1. Go to branch protection settings
2. Click on the rule for `main`
3. Scroll to bottom
4. Click "Delete rule" (red button)
5. Make your emergency changes
6. Re-create the rule following this guide

---

## Part 7: After Setup Checklist

### For Each Repository:

- [ ] Branch protection rule created for `main` branch
- [ ] At least 1 approval required
- [ ] Status checks configured (if applicable)
- [ ] Conversation resolution required
- [ ] Direct push test FAILED (good! protection working)
- [ ] Test PR created and merged successfully
- [ ] Team notified of new process

### Team Notification

Send this message to your team:

```
Subject: Branch Protection Now Enabled

Hi Team,

We've enabled branch protection on our repositories. Here's what changed:

✅ No direct pushes to main branch
✅ All changes must go through Pull Requests
✅ Tests must pass before merge
✅ 1 approval required
✅ All comments must be resolved

How to work now:
1. Create feature branch: git checkout -b feature/my-feature
2. Make changes and commit
3. Push: git push origin feature/my-feature
4. Create PR on GitHub
5. Wait for tests to pass (green checkmark)
6. Get 1 approval from teammate
7. Resolve all review comments
8. Click "Merge pull request"

Documentation: [link to BRANCH_PROTECTION_GUIDE.md]

Questions? Contact DevOps team.
```

---

## Part 8: Quick Reference Card

### UI Repository (fincore_WebUI)

```
Repository: fincore_WebUI
Branch: main
Approvals: 1 required
Status Checks: test (E2E tests, 136 tests, ~3 minutes)
Settings URL: https://github.com/kasisheraz/fincore_WebUI/settings/branches
```

### Backend Repository (userManagementApi)

```
Repository: userManagementApi
Branch: main
Approvals: 1 required
Status Checks:
  - Build & Test (always on push to main, ~1 minute)
  - Maven Test (on PRs, ~1 minute)
Settings URL: https://github.com/kasisheraz/userManagementApi/settings/branches
```

### Infrastructure Repository

```
Repository: [Your repo name]
Branch: main
Approvals: 2 required (stricter for infrastructure!)
Status Checks: [Your CI checks if any]
Settings URL: https://github.com/kasisheraz/[REPO_NAME]/settings/branches
```

---

## Part 9: Screenshots Guide

**Since I can't show actual screenshots, here's what to look for at each step**:

### When on Branch Protection Settings Page

**You should see**:
```
┌─────────────────────────────────────────────────────┐
│ Branches                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Branch protection rules                             │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Branch name pattern    Status checks  Actions   │ │
│ │ [Add rule] button (green)                       │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### After Clicking "Add Rule"

**You should see**:
```
┌─────────────────────────────────────────────────────┐
│ Branch protection rule                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Branch name pattern                                 │
│ [ main                                      ]       │
│                                                     │
│ Protect matching branches                           │
│ ☐ Require a pull request before merging           │
│ ☐ Require status checks to pass before merging    │
│ ☐ Require conversation resolution before merging   │
│ ☐ Require signed commits                          │
│ ... more options ...                                │
│                                                     │
│ [Create] button (green)                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Summary

### What You Need to Do

**Time Required**: ~15 minutes total (5 min per repo)

**For Each Repository**:
1. ✅ Open settings URL
2. ✅ Click "Add rule"
3. ✅ Type `main` as branch name
4. ✅ Check the required boxes
5. ✅ Add status checks
6. ✅ Click "Create"
7. ✅ Test with direct push (should fail)
8. ✅ Create test PR (should work)

**Repositories to Configure**:
- [ ] fincore_WebUI (UI)
- [ ] userManagementApi (Backend)
- [ ] [Your infrastructure repo]

**After Setup**:
- [ ] All 3 repos protected
- [ ] Team notified
- [ ] Documentation shared
- [ ] Test PR created and merged

---

## Need Help?

**Can't find a setting?**
- Look for exact text in quotes from this guide
- All checkboxes are listed in order they appear

**Tests not showing as status checks?**
- Trigger a workflow run first
- Wait for completion
- Refresh settings page

**Want stricter rules?**
- Increase approvals to 2
- Enable "Require review from Code Owners"
- Enable "Require signed commits"

**Have questions?**
- Check: [BRANCH_PROTECTION_GUIDE.md](BRANCH_PROTECTION_GUIDE.md) (detailed version)
- Contact: DevOps team
- GitHub Docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches

---

**Last Updated**: March 16, 2026  
**Version**: 1.0  
**Status**: Ready to use ✅
