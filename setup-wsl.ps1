# WSL 2 Installation Script for Docker Desktop
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "WSL 2 Setup for Docker Desktop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor Gray
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Gray
    Write-Host "3. Run this script again" -ForegroundColor Gray
    Write-Host ""
    pause
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Detect processor architecture
$cpu = (Get-ComputerInfo).CsProcessors[0].Name
Write-Host "Detected CPU: $cpu" -ForegroundColor Gray

if ($cpu -match "Snapdragon|Qualcomm|ARM") {
    Write-Host "✓ ARM64 processor detected - WSL 2 is required for Docker Desktop" -ForegroundColor Yellow
} else {
    Write-Host "ℹ Intel/AMD processor detected" -ForegroundColor Gray
}

Write-Host ""

# Check if WSL is already installed
Write-Host "Checking WSL status..." -ForegroundColor Yellow
$wslInstalled = $false
try {
    $wslStatus = wsl --status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ WSL is already installed" -ForegroundColor Green
        Write-Host $wslStatus -ForegroundColor Gray
        $wslInstalled = $true
    }
} catch {
    Write-Host "WSL is not installed" -ForegroundColor Gray
}

if (-not $wslInstalled) {
    Write-Host ""
    Write-Host "Installing WSL 2..." -ForegroundColor Yellow
    Write-Host "This will:" -ForegroundColor Gray
    Write-Host "  • Enable Windows Subsystem for Linux" -ForegroundColor Gray
    Write-Host "  • Enable Virtual Machine Platform" -ForegroundColor Gray
    Write-Host "  • Install Ubuntu Linux distribution" -ForegroundColor Gray
    Write-Host "  • Require a system restart" -ForegroundColor Gray
    Write-Host ""
    
    $confirm = Read-Host "Continue with installation? (Y/n)"
    if ($confirm -eq "n" -or $confirm -eq "N") {
        Write-Host "Installation cancelled" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "Starting WSL installation..." -ForegroundColor Yellow
    Write-Host "This may take 5-10 minutes..." -ForegroundColor Gray
    Write-Host ""
    
    wsl --install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ WSL Installation Complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: You must restart your computer now." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "After restart:" -ForegroundColor Cyan
        Write-Host "1. A Linux terminal window will open automatically" -ForegroundColor Gray
        Write-Host "2. Create a username and password when prompted" -ForegroundColor Gray
        Write-Host "3. Start Docker Desktop" -ForegroundColor Gray
        Write-Host "4. Run: .\docker-test-local.ps1" -ForegroundColor Gray
        Write-Host ""
        
        $restart = Read-Host "Restart now? (Y/n)"
        if ($restart -ne "n" -and $restart -ne "N") {
            Write-Host "Restarting in 5 seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
            Restart-Computer
        } else {
            Write-Host ""
            Write-Host "Remember to restart before using Docker Desktop!" -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "❌ Installation failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Try manual installation:" -ForegroundColor Yellow
        Write-Host "1. Open Settings → Apps → Optional Features" -ForegroundColor Gray
        Write-Host "2. Click 'More Windows features'" -ForegroundColor Gray
        Write-Host "3. Enable: Windows Subsystem for Linux" -ForegroundColor Gray
        Write-Host "4. Enable: Virtual Machine Platform" -ForegroundColor Gray
        Write-Host "5. Restart your computer" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Or follow the guide: WSL_SETUP_GUIDE.md" -ForegroundColor Gray
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "✓ WSL is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Cyan
    Write-Host "1. Start Docker Desktop" -ForegroundColor Gray
    Write-Host "2. Run: .\docker-test-local.ps1" -ForegroundColor Gray
    Write-Host ""
}
