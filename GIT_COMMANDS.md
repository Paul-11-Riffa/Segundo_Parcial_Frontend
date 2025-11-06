# 🚀 COMANDOS PARA SUBIR LOS CAMBIOS AL REPOSITORIO

## Opción 1: Commit Todo de una vez

```bash
cd FRONTEND/Segundo_Parcial_Frontend

# Ver el estado actual
git status

# Agregar todos los cambios
git add .

# Hacer commit con mensaje descriptivo
git commit -m "Agregar módulo completo de reportes por comando de voz con UX/UI optimizado

- Servicio voiceCommandService.js para comunicación con backend
- Hook useVoiceCommand.js con manejo de 6 estados (IDLE, LISTENING, PROCESSING, GENERATING, SUCCESS, ERROR)
- Componente VoiceCommandModal.jsx con diseño UX/UI según especificaciones
- Animación VoiceWaveAnimation para estado de escucha
- Botón global de voz en Header junto a notificaciones
- Página VoiceReportsPage.jsx para historial completo
- Componente Dialog.jsx basado en Radix UI
- Integración con Web Speech API para reconocimiento de voz
- Entrada manual alternativa con ejemplos predefinidos
- Sistema de descarga de reportes PDF/Excel
- Rutas y navegación actualizadas
- Documentación completa en VOICE_MODULE_README.md"

# Subir al repositorio
git push origin main
```

---

## Opción 2: Commit por Módulos (Más organizado)

### 1. Servicios y Hooks
```bash
git add src/services/admin/voiceCommandService.js
git add src/hooks/admin/useVoiceCommand.js
git commit -m "Agregar servicio de API y hook personalizado para comandos de voz"
```

### 2. Componentes de Voz
```bash
git add src/components/admin/voice/
git add src/components/ui/dialog.jsx
git commit -m "Agregar componentes visuales del módulo de voz (Modal, Animación, Dialog)"
```

### 3. Página de Historial
```bash
git add src/pages/admin/voice/VoiceReportsPage.jsx
git commit -m "Agregar página de historial de reportes por voz"
```

### 4. Integración en Layout
```bash
git add src/components/admin/Header.jsx
git add src/components/admin/Sidebar.jsx
git add src/App.jsx
git commit -m "Integrar módulo de voz en Header, Sidebar y rutas"
```

### 5. Estilos y Documentación
```bash
git add src/index.css
git add VOICE_MODULE_README.md
git add VOICE_MODULE_SUMMARY.md
git add install-voice-module.ps1
git commit -m "Agregar estilos, animaciones y documentación del módulo de voz"
```

### 6. Push Final
```bash
git push origin main
```

---

## Verificación Rápida antes de Commit

```bash
# Ver qué archivos se van a agregar
git status

# Ver diferencias de un archivo específico
git diff src/components/admin/Header.jsx

# Ver todos los archivos nuevos
git ls-files --others --exclude-standard
```

---

## Si hay conflictos

```bash
# Traer cambios del remoto
git pull origin main

# Resolver conflictos manualmente
# Luego:
git add .
git commit -m "Resolver conflictos y agregar módulo de voz"
git push origin main
```

---

## Rollback (por si algo sale mal)

```bash
# Ver los últimos commits
git log --oneline

# Volver al commit anterior (sin perder cambios)
git reset --soft HEAD~1

# O deshacer completamente el último commit
git reset --hard HEAD~1
```

---

## 📋 Checklist antes de Push

- [ ] Todos los archivos están agregados con `git add .`
- [ ] El commit tiene un mensaje descriptivo
- [ ] No hay archivos sensibles (.env, credenciales)
- [ ] El backend está funcionando correctamente
- [ ] El frontend compila sin errores (`npm run build`)
- [ ] Se instaló @radix-ui/react-dialog (`npm install @radix-ui/react-dialog`)

---

## 🎯 Comando Rápido (Copy-Paste)

```bash
cd FRONTEND/Segundo_Parcial_Frontend && git add . && git commit -m "Agregar módulo completo de reportes por comando de voz" && git push origin main
```

---

## 📊 Resumen de Cambios

**Archivos Nuevos (11):**
- src/services/admin/voiceCommandService.js
- src/hooks/admin/useVoiceCommand.js
- src/components/admin/voice/VoiceCommandModal.jsx
- src/components/admin/voice/VoiceWaveAnimation.jsx
- src/components/admin/voice/VoiceWaveAnimation.css
- src/components/ui/dialog.jsx
- src/pages/admin/voice/VoiceReportsPage.jsx
- VOICE_MODULE_README.md
- VOICE_MODULE_SUMMARY.md
- install-voice-module.ps1
- GIT_COMMANDS.md (este archivo)

**Archivos Modificados (4):**
- src/components/admin/Header.jsx
- src/components/admin/Sidebar.jsx
- src/App.jsx
- src/index.css

**Total: 15 archivos afectados**

---

✅ **¡Listo para subir!**
