# 🚀 Cómo Iniciar el Sistema

## Método Rápido (Recomendado)

Ejecuta el script automático:

```powershell
.\iniciar-sistema.ps1
```

Este script:
- ✅ Detecta automáticamente tu IP de red
- ✅ Pregunta si necesitas acceso desde otros dispositivos
- ✅ Configura todo correctamente
- ✅ Inicia backend y frontend en ventanas separadas

## Método Manual

### 1. Iniciar Backend

```powershell
cd backend
node server.js
```

### 2. Iniciar Frontend (en otra terminal)

**Para uso local (recomendado):**
```powershell
cd frontend
npm run dev
```

**Para acceso desde red (otros dispositivos):**
```powershell
cd frontend
$env:VITE_BACKEND_HOST = "TU_IP_AQUI"  # Ejemplo: 192.168.100.17
npm run dev
```

## 📍 Accesos

### Uso Local
- Frontend: **https://localhost:5175**
- Backend: **https://localhost:3443**

### Desde otros dispositivos en la red
- Frontend: **https://TU_IP:5175** (ejemplo: https://192.168.100.17:5175)
- Backend: **https://TU_IP:3443**

## ⚠️ Notas Importantes

1. **Certificados SSL**: Siempre verás una advertencia de seguridad porque usamos certificados auto-firmados. Es normal, simplemente acepta el riesgo.

2. **Cambio de Red**: Si cambias de red (WiFi diferente, etc.), simplemente:
   - Cierra los servidores (Ctrl+C)
   - Vuelve a ejecutar `.\iniciar-sistema.ps1`
   - El script detectará la nueva IP automáticamente

3. **Uso Recomendado**: Para desarrollo en tu computadora, SIEMPRE usa `https://localhost:5175` (no uses la IP de red). Solo usa la IP de red cuando necesites acceder desde otro dispositivo (móvil, tablet, etc.).

4. **Puertos Ocupados**: Si el puerto 5173, 5174 o 5175 está ocupado, Vite intentará el siguiente disponible automáticamente.

## 🐛 Solución de Problemas

### "No se puede conectar"
- ✅ Verifica que ambos servidores estén corriendo
- ✅ Usa `https://localhost:5175` (no la IP de red) cuando trabajes local
- ✅ Acepta el certificado SSL en el navegador

### "Algo salió mal" al hacer login
- ✅ Verifica que el backend esté corriendo sin errores
- ✅ Revisa la consola del navegador (F12) para ver logs detallados
- ✅ Verifica que PostgreSQL esté corriendo

### Error de red al acceder desde otro dispositivo
- ✅ Verifica que el firewall permita conexiones en los puertos 3443 y 5175
- ✅ Asegúrate de usar la IP correcta de tu red
- ✅ Ambos dispositivos deben estar en la misma red WiFi

## 📚 Más Información

Para configuración avanzada, consulta los archivos:
- `CONFIGURACION_RED_AUTOMATICA.md`
- `HTTPS_LISTO.md`
- `vite.config.js`
