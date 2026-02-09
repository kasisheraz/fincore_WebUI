# PowerShell script to start FinCore React development server

# Add Node.js to PATH for this session
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

# Check if Node.js is available
try {
    $nodeVersion = & node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found. Please install Node.js or check your PATH." -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = & npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm not found. Please check your Node.js installation." -ForegroundColor Red
    exit 1
}

# Start the development server
Write-Host "Starting FinCore React development server..." -ForegroundColor Yellow
Write-Host "The application will be available at: http://localhost:3000" -ForegroundColor Cyan

& npm start