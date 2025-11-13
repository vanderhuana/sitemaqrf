# Script para iniciar el sistema completo (backend + frontend)
# Detecta automáticamente la IP de red correcta

Write-Host "🚀 Iniciando Sistema SISQR..." -ForegroundColor Cyan
Write-Host ""

# Detectar IP de red automáticamente
$networkIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" 
} | Select-Object -First 1).IPAddress

if ($networkIP) {
    Write-Host "🌐 IP de red detectada: $networkIP" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se detectó IP de red, usando localhost" -ForegroundColor Yellow
    $networkIP = "localhost"
}

Write-Host ""
Write-Host "📍 Configuración:" -ForegroundColor Cyan
Write-Host "  - Backend:  https://localhost:3443" -ForegroundColor White
Write-Host "  - Frontend: https://localhost:5175" -ForegroundColor White
if ($networkIP -ne "localhost") {
    Write-Host "  - Red:      https://$networkIP:5175" -ForegroundColor White
}
Write-Host ""

# Preguntar si quiere acceso desde red
$useNetwork = Read-Host "¿Necesitas acceder desde otros dispositivos en la red? (s/n)"

if ($useNetwork -eq "s" -or $useNetwork -eq "S") {
    if ($networkIP -ne "localhost") {
        Write-Host "✅ Configurando para acceso en red..." -ForegroundColor Green
        $env:VITE_BACKEND_HOST = $networkIP
        Write-Host "📱 Otros dispositivos pueden acceder a: https://$networkIP:5175" -ForegroundColor Cyan
        Write-Host "⚠️  Recuerda aceptar el certificado en cada dispositivo" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  No se detectó IP de red válida" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Configurando para uso local (recomendado)..." -ForegroundColor Green
    Write-Host "💡 Accede a: https://localhost:5175" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🔄 Iniciando servidores..." -ForegroundColor Cyan
Write-Host ""

# Iniciar backend en nueva ventana
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Iniciando Backend...' -ForegroundColor Green; node server.js"

# Esperar 3 segundos para que el backend inicie
Start-Sleep -Seconds 3

# Iniciar frontend en nueva ventana
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '🎨 Iniciando Frontend...' -ForegroundColor Blue; npm run dev"

Write-Host ""
Write-Host "✅ Sistema iniciado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Accede a: https://localhost:5175" -ForegroundColor Cyan
if ($useNetwork -eq "s" -or $useNetwork -eq "S") {
    if ($networkIP -ne "localhost") {
        Write-Host "📍 Desde red: https://$networkIP:5175" -ForegroundColor Cyan
    }
}
Write-Host ""
Write-Host "💡 Para detener: Cierra las ventanas de PowerShell que se abrieron" -ForegroundColor Yellow
Write-Host ""
