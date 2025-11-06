# 🔍 Setup Verification Script
# Run this script to verify everything is installed correctly

Write-Host "🚀 DuBuddy Platform - Setup Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
try {
    $nodeVersion = node --version
    if ($nodeVersion -match "v(\d+)\.") {
        $major = [int]$Matches[1]
        if ($major -ge 18) {
            Write-Host " ✅ $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host " ❌ Version $nodeVersion (need 18+)" -ForegroundColor Red
            $allGood = $false
        }
    }
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -NoNewline
try {
    $npmVersion = npm --version
    Write-Host " ✅ v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not installed" -ForegroundColor Red
    $allGood = $false
}

# Check if in correct directory
Write-Host "Checking directory structure..." -NoNewline
if ((Test-Path "backend") -and (Test-Path "frontend") -and (Test-Path "package.json")) {
    Write-Host " ✅ Correct directory" -ForegroundColor Green
} else {
    Write-Host " ❌ Run from project root" -ForegroundColor Red
    $allGood = $false
}

# Check root dependencies
Write-Host "Checking root dependencies..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " ✅ Installed" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Run 'npm install'" -ForegroundColor Yellow
    $allGood = $false
}

# Check backend dependencies
Write-Host "Checking backend dependencies..." -NoNewline
if (Test-Path "backend\node_modules") {
    Write-Host " ✅ Installed" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Run 'cd backend && npm install'" -ForegroundColor Yellow
    $allGood = $false
}

# Check frontend dependencies
Write-Host "Checking frontend dependencies..." -NoNewline
if (Test-Path "frontend\node_modules") {
    Write-Host " ✅ Installed" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Run 'cd frontend && npm install'" -ForegroundColor Yellow
    $allGood = $false
}

# Check Prisma setup
Write-Host "Checking Prisma setup..." -NoNewline
if (Test-Path "backend\node_modules\.prisma") {
    Write-Host " ✅ Generated" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Run 'cd backend && npx prisma generate'" -ForegroundColor Yellow
}

# Check database
Write-Host "Checking database..." -NoNewline
if (Test-Path "backend\dev.db") {
    Write-Host " ✅ Created" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Run 'cd backend && npx prisma migrate dev'" -ForegroundColor Yellow
}

# Check model files
Write-Host "Checking model files..." -NoNewline
$modelCount = (Get-ChildItem "backend\models\*.json" -ErrorAction SilentlyContinue).Count
if ($modelCount -gt 0) {
    Write-Host " ✅ $modelCount models found" -ForegroundColor Green
} else {
    Write-Host " ℹ️  No models yet (sample models provided)" -ForegroundColor Cyan
}

# Check ports availability
Write-Host "`nChecking port availability..." -ForegroundColor Cyan

Write-Host "Checking port 5000 (backend)..." -NoNewline
$port5000 = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $port5000) {
    Write-Host " ✅ Available" -ForegroundColor Green
} else {
    Write-Host " ⚠️  In use" -ForegroundColor Yellow
}

Write-Host "Checking port 3000 (frontend)..." -NoNewline
$port3000 = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $port3000) {
    Write-Host " ✅ Available" -ForegroundColor Green
} else {
    Write-Host " ⚠️  In use" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ All checks passed! Ready to run." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: npm run dev" -ForegroundColor White
    Write-Host "  2. Open: http://localhost:3000" -ForegroundColor White
    Write-Host "  3. Register as Admin and explore!" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues found. Please fix them first." -ForegroundColor Yellow
    Write-Host "`nQuick fix commands:" -ForegroundColor Cyan
    Write-Host "  npm install" -ForegroundColor White
    Write-Host "  cd backend && npm install" -ForegroundColor White
    Write-Host "  cd backend && npx prisma migrate dev --name init" -ForegroundColor White
    Write-Host "  cd ../frontend && npm install" -ForegroundColor White
}

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - README.md       : Complete documentation" -ForegroundColor White
Write-Host "  - QUICKSTART.md   : 5-minute setup guide" -ForegroundColor White
Write-Host "  - DEMO.md         : Demo script with examples" -ForegroundColor White
Write-Host "  - PROJECT_SUMMARY.md : Project overview" -ForegroundColor White

Write-Host "`n🎯 Need help? Check the documentation above!" -ForegroundColor Cyan
