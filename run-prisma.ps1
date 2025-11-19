# Prisma Migration and Generation Script
# Make sure to stop the dev server (npm run dev) before running this script

Write-Host "Setting DATABASE_URL..." -ForegroundColor Cyan
$env:DATABASE_URL = "file:./prisma/dev.db"

Write-Host "`nRunning Prisma migrations..." -ForegroundColor Yellow
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migrations deployed successfully" -ForegroundColor Green
    
    Write-Host "`nGenerating Prisma client..." -ForegroundColor Yellow
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Prisma client generated successfully!" -ForegroundColor Green
        Write-Host "`nYou can now start the dev server with: npm run dev" -ForegroundColor Cyan
    } else {
        Write-Host "`n✗ Failed to generate Prisma client" -ForegroundColor Red
        Write-Host "Make sure no dev server is running. Stop it with Ctrl+C and try again." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✗ Failed to deploy migrations" -ForegroundColor Red
}

