# Load Full Database Schema
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$sqlFile = "c:\Users\kkhha\OneDrive\Desktop\MyStatArena_ik\database\statarena_database.sql"

Write-Host "Loading full database schema..." -ForegroundColor Cyan
Write-Host "Please enter your MySQL root password when prompted." -ForegroundColor Yellow
Write-Host ""

# Execute MySQL command
& $mysqlPath -u root -p -e "source $sqlFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database loaded successfully!" -ForegroundColor Green
    Write-Host "The predictions feature should now work correctly." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error loading database" -ForegroundColor Red
}
