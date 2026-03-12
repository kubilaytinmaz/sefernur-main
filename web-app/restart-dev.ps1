# Sunucuyu yeniden başlatma scripti
# Kullanım: web-app dizininde iken .\restart-dev.ps1 komutunu çalıştırın

Write-Host "Node.js islemleri durduruluyor..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

Write-Host "Bekleniyor..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ".next klasoru siliniyor..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host ".next klasoru silindi" -ForegroundColor Green
} else {
    Write-Host ".next klasoru zaten yok" -ForegroundColor Gray
}

Write-Host "Sunucu baslatiliyor..." -ForegroundColor Yellow
npm run dev
