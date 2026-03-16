# Test Branch Protection Script
# This script verifies that branch protection is working correctly

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Branch Protection Verification" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$repos = @(
    @{
        Name = "fincore_WebUI (UI)"
        Path = "C:\Development\git\fincore_WebUI"
        Expected = "protected branch"
    },
    @{
        Name = "userManagementApi (Backend)"
        Path = "C:\Development\git\userManagementApi"
        Expected = "protected branch"
    }
)

$results = @()

foreach ($repo in $repos) {
    Write-Host "Testing: $($repo.Name)" -ForegroundColor Yellow
    Write-Host "Path: $($repo.Path)" -ForegroundColor Gray
    
    # Check if repo exists
    if (-not (Test-Path $repo.Path)) {
        Write-Host "   ❌ Repository not found at: $($repo.Path)" -ForegroundColor Red
        $results += @{ Repo = $repo.Name; Status = "NOT FOUND" }
        Write-Host ""
        continue
    }
    
    # Change to repo directory
    Push-Location $repo.Path
    
    # Track whether the test push actually succeeded
    $pushSucceeded = $false
    
    try {
        # Make sure we're on main branch
        Write-Host "   → Checking out main branch..." -ForegroundColor Gray
        git checkout main 2>&1 | Out-Null
        
        # Pull latest changes
        Write-Host "   → Pulling latest changes..." -ForegroundColor Gray
        git pull origin main 2>&1 | Out-Null
        
        # Try to push an empty commit (this should fail if protection is working)
        Write-Host "   → Testing direct push to main..." -ForegroundColor Gray
        git commit --allow-empty -m "test: verify branch protection" 2>&1 | Out-Null
        $pushResult = git push origin main 2>&1 | Out-String
        
        # Check if push was blocked
        if ($pushResult -match "protected branch|GH006|required|reviews|approval") {
            Write-Host "   ✅ PROTECTED - Direct push blocked!" -ForegroundColor Green
            Write-Host "      Branch protection is working correctly." -ForegroundColor Green
            $results += @{ Repo = $repo.Name; Status = "PROTECTED ✅" }
        }
        elseif ($pushResult -match "Everything up-to-date") {
            Write-Host "   ⚠️  NO TEST PERFORMED - No changes to push" -ForegroundColor Yellow
            Write-Host "      Branch protection status unknown." -ForegroundColor Yellow
            $results += @{ Repo = $repo.Name; Status = "UNKNOWN ⚠️" }
        }
        else {
            Write-Host "   ❌ NOT PROTECTED - Direct push succeeded!" -ForegroundColor Red
            Write-Host "      Branch protection is NOT configured." -ForegroundColor Red
            $results += @{ Repo = $repo.Name; Status = "NOT PROTECTED ❌" }
            $pushSucceeded = $true
        }
        
        if (-not $pushSucceeded) {
            # Clean up - reset the local test commit (no remote divergence)
            Write-Host "   → Cleaning up local test commit..." -ForegroundColor Gray
            git reset --soft HEAD~1 2>&1 | Out-Null
        }
        else {
            Write-Host "   ⚠️  NOTICE: A test commit was pushed to 'origin/main' and remains there." -ForegroundColor Yellow
            Write-Host "      The local branch has NOT been reset to avoid diverging from the remote." -ForegroundColor Yellow
            Write-Host "      If you want to remove this test commit, consider manually reverting it, e.g.:" -ForegroundColor Yellow
            Write-Host "        git log --oneline   # find the test commit" -ForegroundColor Yellow
            Write-Host "        git revert <commit> # safely revert it on main" -ForegroundColor Yellow
            # Alternatively, you could reset and force-push, but that is risky on main and" -ForegroundColor DarkYellow
            Write-Host "        # Alternatively, reset and force-push (RISKY, use with extreme caution):" -ForegroundColor DarkYellow
            Write-Host "        # git reset --hard HEAD~1" -ForegroundColor DarkYellow
            Write-Host "        # git push --force origin main" -ForegroundColor DarkYellow
        }
        
    }
    catch {
        Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{ Repo = $repo.Name; Status = "ERROR ❌" }
    }
    finally {
        Pop-Location
    }
    
    Write-Host ""
}

# Print summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

foreach ($result in $results) {
    $status = $result.Status
    $color = "White"
    if ($status -match "✅") { $color = "Green" }
    elseif ($status -match "❌") { $color = "Red" }
    elseif ($status -match "⚠️") { $color = "Yellow" }
    
    Write-Host "$($result.Repo): " -NoNewline
    Write-Host "$status" -ForegroundColor $color
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan

# Check if all protected
$allProtected = $true
foreach ($result in $results) {
    if ($result.Status -notmatch "PROTECTED ✅") {
        $allProtected = $false
        break
    }
}

if ($allProtected) {
    Write-Host "✅ All repositories are protected!" -ForegroundColor Green
    Write-Host "   No direct pushes to main branch allowed." -ForegroundColor Green
}
else {
    Write-Host "⚠️  Some repositories are not protected." -ForegroundColor Yellow
    Write-Host "   Follow the setup guide to configure protection." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Guide: BRANCH_PROTECTION_STEP_BY_STEP.md" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Note: For infrastructure repository," -ForegroundColor Gray
Write-Host "      run this test manually in that repo folder." -ForegroundColor Gray
Write-Host ""

# Instructions for infrastructure repo
Write-Host "To test infrastructure repo manually:" -ForegroundColor Cyan
Write-Host "  cd C:\Development\git\[YOUR_INFRA_REPO]" -ForegroundColor Gray
Write-Host "  git checkout main" -ForegroundColor Gray
Write-Host "  git commit --allow-empty -m 'test'" -ForegroundColor Gray
Write-Host "  git push origin main" -ForegroundColor Gray
Write-Host "  # Should see error about protected branch" -ForegroundColor Gray
Write-Host ""
