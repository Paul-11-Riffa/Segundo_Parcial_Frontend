# Script de Instalación - Módulo de Comandos de Voz
# Ejecutar desde: FRONTEND/Segundo_Parcial_Frontend/

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  INSTALACIÓN MÓDULO DE VOZ  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Instalar dependencias
Write-Host "📦 Instalando @radix-ui/react-dialog..." -ForegroundColor Yellow
npm install @radix-ui/react-dialog

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 2: Verificar archivos creados
Write-Host "🔍 Verificando archivos del módulo..." -ForegroundColor Yellow

$archivos = @(
    "src/services/admin/voiceCommandService.js",
    "src/hooks/admin/useVoiceCommand.js",
    "src/components/admin/voice/VoiceCommandModal.jsx",
    "src/components/admin/voice/VoiceWaveAnimation.jsx",
    "src/components/admin/voice/VoiceWaveAnimation.css",
    "src/components/ui/dialog.jsx",
    "src/pages/admin/voice/VoiceReportsPage.jsx"
)

$todosExisten = $true
foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "  ✓ $archivo" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $archivo (FALTA)" -ForegroundColor Red
        $todosExisten = $false
    }
}

Write-Host ""

if ($todosExisten) {
    Write-Host "✅ Todos los archivos están presentes" -ForegroundColor Green
} else {
    Write-Host "⚠️  Algunos archivos faltan" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  INSTALACIÓN COMPLETADA  " -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Asegúrate de que el backend esté corriendo:" -ForegroundColor White
Write-Host "   python manage.py runserver" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Inicia el servidor de desarrollo:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Abre el navegador y haz click en el ícono 🎤 en el header" -ForegroundColor White
Write-Host ""
Write-Host "Para commit:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Agregar módulo completo de reportes por comando de voz'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
