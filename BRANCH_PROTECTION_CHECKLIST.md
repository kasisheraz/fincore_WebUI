# Branch Protection Configuration Checklist

Print this page and check off items as you complete them!

---

## 🎯 Repository 1: fincore_WebUI (UI)

### Setup Steps

- [ ] **Step 1**: Open browser to: `https://github.com/kasisheraz/fincore_WebUI/settings/branches`

- [ ] **Step 2**: Click green "Add rule" button

- [ ] **Step 3**: Type `main` in "Branch name pattern" field

- [ ] **Step 4**: Check these boxes:
  - [ ] ✅ Require a pull request before merging
    - [ ] ✅ Require approvals: **1**
    - [ ] ✅ Dismiss stale pull request approvals when new commits are pushed
  
  - [ ] ✅ Require status checks to pass before merging
    - [ ] ✅ Require branches to be up to date before merging
    - [ ] ✅ Search "test" and select: **test**
  
  - [ ] ✅ Require conversation resolution before merging

- [ ] **Step 5**: Click green "Create" button at bottom

- [ ] **Step 6**: Verify - Run this in PowerShell:
  ```powershell
  cd C:\Development\git\fincore_WebUI
  git checkout main
  git commit --allow-empty -m "test"
  git push origin main
  # Should show ERROR about protected branch ✅
  ```

**Status**: ⬜ Not Started  |  ⬜ In Progress  |  ⬜ Complete

---

## 🎯 Repository 2: userManagementApi (Backend)

### Setup Steps

- [ ] **Step 1**: Open browser to: `https://github.com/kasisheraz/userManagementApi/settings/branches`

- [ ] **Step 2**: Click green "Add rule" button

- [ ] **Step 3**: Type `main` in "Branch name pattern" field

- [ ] **Step 4**: Check these boxes:
  - [ ] ✅ Require a pull request before merging
    - [ ] ✅ Require approvals: **1**
    - [ ] ✅ Dismiss stale pull request approvals when new commits are pushed
  
  - [ ] ✅ Require status checks to pass before merging
    - [ ] ✅ Require branches to be up to date before merging
    - [ ] ✅ Search "build" and select: **Build & Test**
    - [ ] ✅ Search "test" and select: **Maven Test**
  
  - [ ] ✅ Require conversation resolution before merging

- [ ] **Step 5**: Click green "Create" button at bottom

- [ ] **Step 6**: Verify - Run this in PowerShell:
  ```powershell
  cd C:\Development\git\userManagementApi
  git checkout main
  git commit --allow-empty -m "test"
  git push origin main
  # Should show ERROR about protected branch ✅
  ```

**Status**: ⬜ Not Started  |  ⬜ In Progress  |  ⬜ Complete

---

## 🎯 Repository 3: Infrastructure Repository

### Step 0: Identify Repository Name

- [ ] **Repository Name**: _________________________

- [ ] **Repository URL**: `https://github.com/kasisheraz/___________________`

### Setup Steps

- [ ] **Step 1**: Open browser to: `https://github.com/kasisheraz/[REPO_NAME]/settings/branches`

- [ ] **Step 2**: Click green "Add rule" button

- [ ] **Step 3**: Type `main` in "Branch name pattern" field

- [ ] **Step 4**: Check these boxes:
  - [ ] ✅ Require a pull request before merging
    - [ ] ✅ Require approvals: **2** (stricter for infrastructure!)
    - [ ] ✅ Dismiss stale pull request approvals when new commits are pushed
  
  - [ ] ✅ Require status checks to pass before merging (if you have CI)
    - [ ] ✅ Require branches to be up to date before merging
    - [ ] ✅ Add any status checks that exist
  
  - [ ] ✅ Require conversation resolution before merging

- [ ] **Step 5**: Click green "Create" button at bottom

- [ ] **Step 6**: Verify - Run this in PowerShell:
  ```powershell
  cd C:\Development\git\[REPO_NAME]
  git checkout main
  git commit --allow-empty -m "test"
  git push origin main
  # Should show ERROR about protected branch ✅
  ```

**Status**: ⬜ Not Started  |  ⬜ In Progress  |  ⬜ Complete

---

## ✅ Final Verification

### Run Automated Test

- [ ] Run PowerShell script:
  ```powershell
  cd C:\Development\git\fincore_WebUI
  .\test-branch-protection.ps1
  ```

- [ ] All repositories show: **PROTECTED ✅**

### Team Communication

- [ ] Email sent to team about new process
- [ ] Documentation links shared:
  - [ ] BRANCH_PROTECTION_STEP_BY_STEP.md
  - [ ] CI_CD_QUALITY_GATES.md

---

## 📝 Notes / Issues

Use this space to write down any issues or questions:

```
_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________
```

---

## 🎉 Completion

**Date Completed**: _______________

**Completed By**: _______________

**All 3 Repositories Protected**: ⬜ YES  |  ⬜ NO

**Team Notified**: ⬜ YES  |  ⬜ NO

---

## Quick Reference

### What to Tell Your Team

```
Starting [DATE], all repositories have branch protection enabled.

New process:
1. Create feature branch (not main)
2. Make changes and commit
3. Push to feature branch
4. Create Pull Request on GitHub
5. Wait for tests to pass
6. Get 1-2 approvals
7. Merge PR (main is updated automatically)

Direct pushes to main are now blocked!
```

### If Someone Gets Blocked

```
Error: "protected branch update failed"

This is expected! You need to:
1. Create a feature branch
2. Push to that branch
3. Create a Pull Request

See: BRANCH_PROTECTION_STEP_BY_STEP.md for details
```

---

**Time Required**: 15-20 minutes for all 3 repos  
**Difficulty**: Easy  
**Impact**: High - Prevents broken code in production!
