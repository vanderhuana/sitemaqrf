import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools' // DESACTIVADO

// Función para obtener la IP local automáticamente
function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorar direcciones internas y no IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        // Priorizar redes WiFi/Ethernet típicas (192.168.x.x, 10.x.x.x)
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
          console.log(`🌐 IP Local detectada: ${iface.address}`)
          return iface.address
        }
      }
    }
  }
  console.log('⚠️  No se detectó IP local, usando localhost')
  return 'localhost'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(), // DESACTIVADO - No cargar Vue DevTools
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Forzar cache busting con hash en nombres de archivos
    rollupOptions: {
      output: {
        // Agregar hash a todos los archivos JS/CSS
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Deshabilitar sourcemaps en producción para reducir tamaño
    sourcemap: false,
    // Optimizar chunks
    chunkSizeWarningLimit: 1000,
  },
  server: (() => {
    // Intentar cargar certificados generados en backend/ssl
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const sslDir = path.resolve(__dirname, '../backend/ssl')
    const pfxPath = path.join(sslDir, 'server.pfx')
    const certPath = path.join(sslDir, 'server.crt')
    const keyPath = path.join(sslDir, 'server.key')

    let httpsOptions = false
    try {
      if (fs.existsSync(pfxPath)) {
        httpsOptions = {
          pfx: fs.readFileSync(pfxPath),
          passphrase: process.env.SSL_PASSPHRASE || 'sisfipo2024'
        }
        console.log('Vite: usando PFX para HTTPS ->', pfxPath)
      } else if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        httpsOptions = {
          cert: fs.readFileSync(certPath),
          key: fs.readFileSync(keyPath)
        }
        console.log('Vite: usando CRT/KEY para HTTPS ->', certPath, keyPath)
      } else {
        console.log('Vite: no se encontraron certificados en backend/ssl; iniciando HTTP')
      }
    } catch (e) {
      console.warn('Vite: error cargando certificados HTTPS:', e && e.message)
      httpsOptions = false
    }

    // Detectar si necesitamos usar IP de red o localhost
    // Por defecto usa localhost (funciona siempre cuando frontend y backend están en la misma máquina)
    // Si defines VITE_BACKEND_HOST, usará esa IP específica
    const useNetworkIP = process.env.VITE_BACKEND_HOST || 'localhost'
    const backendPort = process.env.VITE_BACKEND_PORT || '3443'
    const backendTarget = `https://${useNetworkIP}:${backendPort}`
    
    console.log(`🔗 Configurando proxy hacia: ${backendTarget}`)
    if (useNetworkIP === 'localhost') {
      const detectedIP = getLocalIP()
      console.log(`💡 Usando localhost (recomendado para desarrollo local)`)
      console.log(`💡 IP de red detectada: ${detectedIP}`)
      console.log(`💡 Para acceso desde otros dispositivos, define: VITE_BACKEND_HOST=${detectedIP}`)
    } else {
      console.log(`🌐 Usando IP de red: ${useNetworkIP}`)
    }
    
    return {
      host: '0.0.0.0', // Escuchar en todas las interfaces de red
      port: 5173,
      https: httpsOptions,
      proxy: {
        '/api': {
          // Proxy hacia backend HTTPS con IP local detectada automáticamente
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    }
  })()
})
