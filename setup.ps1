# StatArena Backend - Quick Start Script
# Run this script to set up everything automatically

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  StatArena Backend Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if MySQL is installed
Write-Host "Checking MySQL installation..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MySQL not found in PATH" -ForegroundColor Yellow
    Write-Host "Make sure MySQL is installed and added to PATH" -ForegroundColor Yellow
}

Write-Host ""

# Navigate to backend directory
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath
Write-Host "📂 Working directory: $backendPath" -ForegroundColor Cyan
Write-Host ""

# Install npm dependencies
Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit backend/.env and set your MySQL password!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Prompt for database setup
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Database Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Do you want to set up the database now? (Y/N)" -ForegroundColor Yellow
$setupDB = Read-Host

if ($setupDB -eq "Y" -or $setupDB -eq "y") {
    Write-Host ""
    Write-Host "Enter your MySQL root password:" -ForegroundColor Yellow
    $mysqlPassword = Read-Host -AsSecureString
    $mysqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)
    )
    
    # Update .env file with password
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace 'DB_PASSWORD=.*', "DB_PASSWORD=$mysqlPasswordPlain"
    Set-Content ".env" -Value $envContent
    
    Write-Host "✅ Password saved to .env" -ForegroundColor Green
    Write-Host ""
    Write-Host "Creating database and importing data..." -ForegroundColor Yellow
    
    $databasePath = Join-Path $PSScriptRoot "database\statarena_database.sql"
    
    # Create database and import
    $createDB = @"
CREATE DATABASE IF NOT EXISTS statarena;
USE statarena;
SOURCE $databasePath;
"@
    
    $createDB | mysql -u root -p"$mysqlPasswordPlain" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created and data imported successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database setup may have issues. Check manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Skipping database setup" -ForegroundColor Yellow
    Write-Host "You can set it up manually later using SETUP_GUIDE.md" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Backend is ready to run!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review and update backend/.env if needed" -ForegroundColor White
Write-Host "2. Start the server with: npm run dev" -ForegroundColor White
Write-Host "3. Test the API at: http://localhost:3000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see backend/SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to start the server now
Write-Host "Do you want to start the server now? (Y/N)" -ForegroundColor Yellow
$startServer = Read-Host

if ($startServer -eq "Y" -or $startServer -eq "y") {
    Write-Host ""
    Write-Host "🚀 Starting server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "You can start the server later with:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
}
