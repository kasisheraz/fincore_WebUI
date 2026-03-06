# Docker Desktop Setup for ARM Windows (Snapdragon X)

Your system has a **Qualcomm Snapdragon X (Oryon CPU)** - an ARM64 processor.
Docker Desktop on ARM Windows requires **WSL 2** to run.

## Quick Fix (Run as Administrator)

### Option 1: Automated Installation (Recommended)

**Open PowerShell as Administrator** and run:

```powershell
# Install WSL 2 with default Ubuntu distribution
wsl --install

# After installation completes, restart your computer
Restart-Computer
```

### Option 2: Manual Installation

If the automatic install doesn't work, follow these steps:

#### Step 1: Enable WSL and Virtual Machine Platform

Open PowerShell as Administrator:

```powershell
# Enable WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart computer
Restart-Computer
```

#### Step 2: Set WSL 2 as Default

After restart, open PowerShell as Administrator:

```powershell
# Set WSL 2 as default version
wsl --set-default-version 2
```

#### Step 3: Install a Linux Distribution

```powershell
# Install Ubuntu (or choose another from Microsoft Store)
wsl --install -d Ubuntu
```

## After Installation

1. **Restart your computer** (required)
2. **Setup your Linux username and password** when prompted
3. **Start Docker Desktop** - it should now work properly

## Verify Installation

After restart, run in PowerShell:

```powershell
wsl --status
wsl --list --verbose
```

You should see:
- WSL version: 2.x.x.x
- Default Version: 2
- Your Linux distribution listed

## Then Test Docker

Once WSL 2 is installed and Docker Desktop starts successfully:

```powershell
# Test Docker
docker --version
docker ps

# Run the local test
.\docker-test-local.ps1
```

## Important Notes for ARM64 (Snapdragon X)

✅ **Good News**: 
- Docker Desktop supports ARM64 Windows
- Your React/Node.js app will work fine
- Most Node.js and nginx images have ARM64 versions

⚠️ **Potential Issues**:
- Some Docker images might not have ARM64 versions
- If you see "no matching manifest" errors, the image isn't available for ARM64
- You may need to specify ARM64-compatible base images

### ARM64-Compatible Images Used in Your Dockerfile:
- ✅ `node:18-alpine` - supports ARM64
- ✅ `nginx:alpine` - supports ARM64

Your current Dockerfile is already ARM64-compatible! 🎉

## Troubleshooting

### "WSL 2 requires an update to its kernel component"

Download and install the WSL2 Linux kernel update:
https://aka.ms/wsl2kernel

### Docker Desktop still won't start

1. Make sure you've restarted after installing WSL
2. Open Docker Desktop settings → General → Use WSL 2 based engine (should be checked)
3. Try restarting Docker Desktop

### Need to run Docker without WSL?

Unfortunately, Docker Desktop on ARM Windows **requires** WSL 2. There's no Hyper-V option for ARM processors.

## Alternative: Use GitHub Codespaces

If you can't get WSL 2 working, you can develop and test using GitHub Codespaces:

1. Push your code to GitHub
2. Create a Codespace (Dev Containers → New Codespace)
3. Docker works natively in Codespaces
4. Test your builds there before deploying

---

## Summary of Steps

1. ✅ Open PowerShell as Administrator
2. ✅ Run: `wsl --install`
3. ✅ Restart computer (required!)
4. ✅ Setup Linux username/password when prompted
5. ✅ Start Docker Desktop
6. ✅ Run: `.\docker-test-local.ps1`

**After these steps, your Docker setup will be ready for local testing!**
