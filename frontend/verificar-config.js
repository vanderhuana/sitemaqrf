// Script para verificar la configuración de red del frontend
import os from 'os'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('\n🔍 DIAGNÓSTICO DE CONFIGURACIÓN\n')
console.log('=' .repeat(50))

// Leer archivo .env.development manualmente
const envPath = path.join(__dirname, '.env.development')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^VITE_(\w+)=(.*)$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

console.log('\n📋 Variables de entorno en .env.development:')
console.log('  VITE_BACKEND_HOST:', envVars.BACKEND_HOST || '❌ NO CONFIGURADO (usará localhost)')
console.log('  VITE_BACKEND_PORT:', envVars.BACKEND_PORT || '❌ NO CONFIGURADO (usará 3443)')
console.log('  VITE_API_URL:', envVars.API_URL || '✅ Vacío (usará proxy)')

// Detectar IPs locales
console.log('\n🌐 IPs detectadas en este equipo:')
const interfaces = os.networkInterfaces()
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      const emoji = iface.address.startsWith('192.168.') || iface.address.startsWith('10.') ? '✅' : '⚠️'
      console.log(`  ${emoji} ${name}: ${iface.address}`)
    }
  }
}

// Calcular URL del proxy
const backendHost = envVars.BACKEND_HOST || 'localhost'
const backendPort = envVars.BACKEND_PORT || '3443'
const backendUrl = `https://${backendHost}:${backendPort}`

console.log('\n🔗 Configuración del proxy:')
console.log('  Target:', backendUrl)
console.log('  Rutas:', '/api/* → ' + backendUrl + '/api/*')

console.log('\n💡 RECOMENDACIONES:')
if (!envVars.BACKEND_HOST) {
  console.log('  ⚠️  VITE_BACKEND_HOST no está configurado')
  console.log('     Agrega en .env.development: VITE_BACKEND_HOST=192.168.1.4')
} else {
  console.log('  ✅ VITE_BACKEND_HOST está configurado correctamente')
}

console.log('\n✅ Para aplicar cambios:')
console.log('  1. Detén el servidor (Ctrl+C)')
console.log('  2. Ejecuta: npm run dev')
console.log('  3. Accede desde: https://192.168.1.4:5173')
console.log('\n' + '='.repeat(50) + '\n')
