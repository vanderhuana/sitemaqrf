<template>
  <div class="pdf-reports-module">
    <div class="header">
      <h2>📊 Módulo de Reportes PDF</h2>
      <p>Genera reportes en PDF con estadísticas de cada módulo del sistema</p>
    </div>

    <!-- Resumen General -->
    <div class="resumen-section" v-if="resumenGeneral">
      <h3>📈 Resumen General del Sistema</h3>
      <div class="stats-grid">
        <div class="stat-card usuarios">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h4>{{ resumenGeneral.usuarios?.total || 0 }}</h4>
            <p>Usuarios</p>
          </div>
        </div>
        
        <div class="stat-card trabajadores">
          <div class="stat-icon">👷</div>
          <div class="stat-info">
            <h4>{{ resumenGeneral.trabajadores || 0 }}</h4>
            <p>Trabajadores</p>
          </div>
        </div>
        
        <div class="stat-card participantes">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <h4>{{ resumenGeneral.participantes || 0 }}</h4>
            <p>Participantes</p>
          </div>
        </div>
        
        <div class="stat-card feipobol">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <h4>{{ resumenGeneral.registrosFeipobol || 0 }}</h4>
            <p>Registro FEIPOBOL</p>
          </div>
        </div>
        
        <div class="stat-card premios">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <h4>{{ resumenGeneral.premios || 0 }}</h4>
            <p>Premios Activos</p>
          </div>
        </div>
        
        <div class="stat-card entradas">
          <div class="stat-icon">🎫</div>
          <div class="stat-info">
            <h4>{{ resumenGeneral.entradasQR || 0 }}</h4>
            <p>Entradas QR</p>
          </div>
        </div>
        
        <div class="stat-card vip">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <h4>{{ resumenGeneral.credenciales?.vip || 0 }}</h4>
            <p>Credenciales VIP</p>
          </div>
        </div>
        
        <div class="stat-card super-vip">
          <div class="stat-icon">👑</div>
          <div class="stat-info">
            <h4>{{ resumenGeneral.credenciales?.superVip || 0 }}</h4>
            <p>Credenciales SUPER VIP</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Módulos de Reportes -->
    <div class="modules-section">
      <h3>📄 Generar Reportes PDF</h3>
      <div class="modules-grid">
        
        <!-- Reporte General -->
        <div class="module-card" @click="generarPDF('general')">
          <div class="module-icon general">📊</div>
          <h4>Reporte General</h4>
          <p>Resumen completo de todos los módulos</p>
          <button class="btn-download" :disabled="generando === 'general'">
            <span v-if="generando === 'general'">⏳ Generando...</span>
            <span v-else>📥 Descargar PDF</span>
          </button>
        </div>
        
        <!-- Gestión de Usuarios -->
        <div class="module-card" @click="generarPDF('usuarios')">
          <div class="module-icon usuarios">👥</div>
          <h4>Gestión de Usuarios</h4>
          <p>Estadísticas de usuarios por rol y estado</p>
          <div class="module-stats" v-if="estadisticasUsuarios">
            <span>Total: {{ estadisticasUsuarios.total }}</span>
            <span>Activos: {{ estadisticasUsuarios.activos }}</span>
          </div>
          <button class="btn-download" :disabled="generando === 'usuarios'">
            <span v-if="generando === 'usuarios'">⏳ Generando...</span>
            <span v-else>📥 Descargar PDF</span>
          </button>
        </div>
        
        <!-- Generador de Entradas QR -->
        <div class="module-card" @click="generarPDF('entradas')">
          <div class="module-icon entradas">🎫</div>
          <h4>Generador de Entradas QR</h4>
          <p>Estadísticas de entradas vendidas y validadas</p>
          <div class="module-stats" v-if="estadisticasEntradas">
            <span>Total: {{ estadisticasEntradas.total }}</span>
            <span>Vendido: Bs. {{ estadisticasEntradas.totalVendido?.toFixed(2) || '0.00' }}</span>
          </div>
          <button class="btn-download" :disabled="generando === 'entradas'">
            <span v-if="generando === 'entradas'">⏳ Generando...</span>
            <span v-else>📥 Descargar PDF</span>
          </button>
        </div>
        
        <!-- Trabajadores -->
        <div class="module-card" @click="generarPDF('trabajadores')">
          <div class="module-icon trabajadores">👷</div>
          <h4>Trabajadores</h4>
          <p>Estadísticas de trabajadores por área y accesos</p>
          <div class="module-stats" v-if="estadisticasTrabajadores">
            <span>Total: {{ estadisticasTrabajadores.total }}</span>
            <span>Con acceso: {{ estadisticasTrabajadores.conAcceso }}</span>
          </div>
          <button class="btn-download" :disabled="generando === 'trabajadores'">
            <span v-if="generando === 'trabajadores'">⏳ Generando...</span>
            <span v-else>📥 Descargar PDF</span>
          </button>
        </div>
        
        <!-- Participantes -->
        <div class="module-card" @click="generarPDF('participantes')">
          <div class="module-icon participantes">🎯</div>
          <h4>Participantes</h4>
          <p>Estadísticas de participantes por empresa</p>
          <div class="module-stats" v-if="estadisticasParticipantes">
            <span>Total: {{ estadisticasParticipantes.total }}</span>
            <span>Con acceso: {{ estadisticasParticipantes.conAcceso }}</span>
          </div>
          <button class="btn-download" :disabled="generando === 'participantes'">
            <span v-if="generando === 'participantes'">⏳ Generando...</span>
            <span v-else>📥 Descargar PDF</span>
          </button>
        </div>
        
        <!-- Registro FEIPOBOL -->
        <div class="module-card" @click="generarPDF('feipobol')">
          <div class="module-icon feipobol">📝</div>
          <h4>Registro FEIPOBOL</h4>
          <p>Estadísticas de registros por zona y carrera</p>
          <div class="module-stats" v-if="estadisticasFeipobol">
            <span>Total: {{ estadisticasFeipobol.total }}</span>
            <span>Con premio: {{ estadisticasFeipobol.conPremio }}</span>
          </div>
          <button class="btn-download" :disabled="generando === 'feipobol'">
            <span v-if="generando === 'feipobol'">⏳ Generando...</span>
            <span v-else>📥 Descargar PDF</span>
          </button>
        </div>
        
        <!-- Premios FEIPOBOL -->
        <div class="module-card" @click="generarPDF('premios')">
          <div class="module-icon premios">🏆</div>
          <h4>Premios FEIPOBOL</h4>
          <p>Lista de premios y valor total</p>
          <div class="module-stats" v-if="estadisticasPremios">
            <span>Premios: {{ estadisticasPremios.activos }}</span>
            <span>Valor: Bs. {{ estadisticasPremios.valorTotal?.toFixed(2) || '0.00' }}</span>
          </div>
          <button class="btn-download" :disabled="generando === 'premios'">
            <span v-if="generando === 'premios'">⏳ Generando...</span>
            <span v-else>📥 Descargar PDF</span>
          </button>
        </div>
        
        <!-- Credenciales VIP -->
        <div class="module-card" @click="generarPDF('credenciales')">
          <div class="module-icon credenciales">⭐</div>
          <h4>Credenciales VIP y SUPER VIP</h4>
          <p>Estadísticas de credenciales generadas y usadas</p>
          <div class="module-stats" v-if="estadisticasCredenciales">
            <span>VIP: {{ estadisticasCredenciales.vip?.total || 0 }}</span>
            <span>SUPER VIP: {{ estadisticasCredenciales.superVip?.total || 0 }}</span>
          </div>
          <button class="btn-download" :disabled="generando === 'credenciales'">
            <span v-if="generando === 'credenciales'">⏳ Generando...</span>
            <span v-else>📥 Descargar PDF</span>
          </button>
        </div>
        
      </div>
    </div>

    <!-- Detalles expandidos -->
    <div v-if="moduloSeleccionado" class="detalles-section">
      <div class="detalles-header">
        <h3>📋 Detalles: {{ getNombreModulo(moduloSeleccionado) }}</h3>
        <button @click="moduloSeleccionado = null" class="btn-cerrar">✕</button>
      </div>
      
      <div class="detalles-content">
        <!-- Detalles Usuarios -->
        <div v-if="moduloSeleccionado === 'usuarios' && estadisticasUsuarios">
          <div class="detalle-grid">
            <div class="detalle-item">
              <span class="label">Total usuarios:</span>
              <span class="value">{{ estadisticasUsuarios.total }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">Activos:</span>
              <span class="value success">{{ estadisticasUsuarios.activos }}</span>
            </div>
            <div class="detalle-item">
              <span class="label">Inactivos:</span>
              <span class="value danger">{{ estadisticasUsuarios.inactivos }}</span>
            </div>
          </div>
          <div class="chart-section" v-if="estadisticasUsuarios.porRol">
            <h4>Por Rol:</h4>
            <div class="bar-chart">
              <div v-for="item in estadisticasUsuarios.porRol" :key="item.role" class="bar-item">
                <span class="bar-label">{{ item.role }}</span>
                <div class="bar-container">
                  <div class="bar-fill" :style="{ width: getBarWidth(item.cantidad, estadisticasUsuarios.total) }"></div>
                  <span class="bar-value">{{ item.cantidad }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Detalles Credenciales -->
        <div v-if="moduloSeleccionado === 'credenciales' && estadisticasCredenciales">
          <div class="credenciales-grid">
            <div class="credencial-card vip">
              <h4>⭐ Credenciales VIP</h4>
              <div class="credencial-stats">
                <div class="stat-row">
                  <span>Total:</span>
                  <strong>{{ estadisticasCredenciales.vip?.total || 0 }}</strong>
                </div>
                <div class="stat-row">
                  <span>Activas:</span>
                  <strong class="success">{{ estadisticasCredenciales.vip?.activas || 0 }}</strong>
                </div>
                <div class="stat-row">
                  <span>Usadas:</span>
                  <strong class="warning">{{ estadisticasCredenciales.vip?.usadas || 0 }}</strong>
                </div>
                <div class="stat-row">
                  <span>Agotadas:</span>
                  <strong class="danger">{{ estadisticasCredenciales.vip?.agotadas || 0 }}</strong>
                </div>
                <div class="stat-row highlight">
                  <span>Disponibles:</span>
                  <strong class="primary">{{ estadisticasCredenciales.vip?.disponibles || 0 }}</strong>
                </div>
              </div>
            </div>
            
            <div class="credencial-card super-vip">
              <h4>👑 Credenciales SUPER VIP</h4>
              <div class="credencial-stats">
                <div class="stat-row">
                  <span>Total:</span>
                  <strong>{{ estadisticasCredenciales.superVip?.total || 0 }}</strong>
                </div>
                <div class="stat-row">
                  <span>Activas:</span>
                  <strong class="success">{{ estadisticasCredenciales.superVip?.activas || 0 }}</strong>
                </div>
                <div class="stat-row">
                  <span>Usadas:</span>
                  <strong class="warning">{{ estadisticasCredenciales.superVip?.usadas || 0 }}</strong>
                </div>
                <div class="stat-row">
                  <span>Agotadas:</span>
                  <strong class="danger">{{ estadisticasCredenciales.superVip?.agotadas || 0 }}</strong>
                </div>
                <div class="stat-row highlight">
                  <span>Disponibles:</span>
                  <strong class="primary">{{ estadisticasCredenciales.superVip?.disponibles || 0 }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="cargando" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando estadísticas...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      <p>❌ {{ error }}</p>
      <button @click="cargarDatos" class="btn-retry">🔄 Reintentar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pdfReportService } from '@/services/api'

// Estados
const cargando = ref(false)
const generando = ref(null)
const error = ref('')
const moduloSeleccionado = ref(null)

// Datos
const resumenGeneral = ref(null)
const estadisticasUsuarios = ref(null)
const estadisticasEntradas = ref(null)
const estadisticasTrabajadores = ref(null)
const estadisticasParticipantes = ref(null)
const estadisticasFeipobol = ref(null)
const estadisticasPremios = ref(null)
const estadisticasCredenciales = ref(null)

// Cargar datos iniciales
const cargarDatos = async () => {
  cargando.value = true
  error.value = ''
  
  try {
    // Cargar resumen general
    const resumenResponse = await pdfReportService.getResumenGeneral()
    if (resumenResponse.success) {
      resumenGeneral.value = resumenResponse.data
    }
    
    // Cargar estadísticas de cada módulo en paralelo
    const [usuarios, entradas, trabajadores, participantes, feipobol, premios, credenciales] = await Promise.all([
      pdfReportService.getEstadisticasUsuarios(),
      pdfReportService.getEstadisticasEntradasQR(),
      pdfReportService.getEstadisticasTrabajadores(),
      pdfReportService.getEstadisticasParticipantes(),
      pdfReportService.getEstadisticasRegistroFeipobol(),
      pdfReportService.getEstadisticasPremios(),
      pdfReportService.getEstadisticasCredencialesVIP()
    ])
    
    if (usuarios.success) estadisticasUsuarios.value = usuarios.data
    if (entradas.success) estadisticasEntradas.value = entradas.data
    if (trabajadores.success) estadisticasTrabajadores.value = trabajadores.data
    if (participantes.success) estadisticasParticipantes.value = participantes.data
    if (feipobol.success) estadisticasFeipobol.value = feipobol.data
    if (premios.success) estadisticasPremios.value = premios.data
    if (credenciales.success) estadisticasCredenciales.value = credenciales.data
    
  } catch (err) {
    console.error('Error cargando datos:', err)
    error.value = 'Error al cargar las estadísticas. Por favor, intenta de nuevo.'
  } finally {
    cargando.value = false
  }
}

// Generar PDF
const generarPDF = async (modulo) => {
  generando.value = modulo
  
  try {
    // Descargar PDF usando fetch con autenticación
    const response = await pdfReportService.descargarPDF(modulo)
    
    if (response.success) {
      // También mostrar detalles del módulo
      moduloSeleccionado.value = modulo
    } else {
      alert('Error al generar el PDF: ' + (response.error || 'Error desconocido'))
    }
    
  } catch (err) {
    console.error('Error generando PDF:', err)
    alert('Error al generar el PDF. Por favor, intenta de nuevo.')
  } finally {
    setTimeout(() => {
      generando.value = null
    }, 1000)
  }
}

// Helpers
const getNombreModulo = (modulo) => {
  const nombres = {
    'general': 'Reporte General',
    'usuarios': 'Gestión de Usuarios',
    'entradas': 'Generador de Entradas QR',
    'trabajadores': 'Trabajadores',
    'participantes': 'Participantes',
    'feipobol': 'Registro FEIPOBOL',
    'premios': 'Premios FEIPOBOL',
    'credenciales': 'Credenciales VIP'
  }
  return nombres[modulo] || modulo
}

const getBarWidth = (cantidad, total) => {
  if (!total) return '0%'
  return `${(cantidad / total) * 100}%`
}

// Inicializar
onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.pdf-reports-module {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2E4A8B;
  margin-bottom: 10px;
}

.header p {
  color: #666;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info h4 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.stat-info p {
  color: #666;
  font-size: 0.85rem;
  margin: 0;
}

/* Colores para cada tipo */
.stat-card.usuarios { border-left: 4px solid #3498db; }
.stat-card.trabajadores { border-left: 4px solid #e67e22; }
.stat-card.participantes { border-left: 4px solid #9b59b6; }
.stat-card.feipobol { border-left: 4px solid #2E4A8B; }
.stat-card.premios { border-left: 4px solid #f1c40f; }
.stat-card.entradas { border-left: 4px solid #27ae60; }
.stat-card.vip { border-left: 4px solid #E74C3C; }
.stat-card.super-vip { border-left: 4px solid #f39c12; }

/* Modules Section */
.modules-section h3,
.resumen-section h3 {
  color: #2E4A8B;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.module-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
  border-color: #2E4A8B;
}

.module-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.module-card h4 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.module-card p {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 15px 0;
}

.module-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 0.85rem;
  color: #2E4A8B;
  font-weight: 500;
}

.btn-download {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #2E4A8B, #1a365d);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.btn-download:hover:not(:disabled) {
  background: linear-gradient(135deg, #1a365d, #0f2744);
  transform: scale(1.02);
}

.btn-download:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Detalles Section */
.detalles-section {
  margin-top: 30px;
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.detalles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.detalles-header h3 {
  margin: 0;
  color: #2E4A8B;
}

.btn-cerrar {
  background: #E74C3C;
  color: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.detalle-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.detalle-item .label {
  display: block;
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.detalle-item .value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
}

.detalle-item .value.success { color: #27ae60; }
.detalle-item .value.danger { color: #E74C3C; }

/* Bar Chart */
.chart-section h4 {
  color: #333;
  margin-bottom: 15px;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-label {
  width: 100px;
  font-size: 0.9rem;
  color: #333;
  text-transform: capitalize;
}

.bar-container {
  flex: 1;
  height: 30px;
  background: #f0f0f0;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(135deg, #2E4A8B, #4a6eb8);
  border-radius: 15px;
  transition: width 0.5s ease;
}

.bar-value {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #333;
  font-size: 0.85rem;
}

/* Credenciales Grid */
.credenciales-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.credencial-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.credencial-card.vip {
  border: 2px solid #E74C3C;
}

.credencial-card.super-vip {
  border: 2px solid #f39c12;
}

.credencial-card h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.credencial-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.stat-row.highlight {
  background: #e8f4fd;
  margin: 10px -10px 0;
  padding: 12px 10px;
  border-radius: 8px;
  border-bottom: none;
}

.stat-row strong {
  font-size: 1.1rem;
}

.stat-row strong.success { color: #27ae60; }
.stat-row strong.warning { color: #f39c12; }
.stat-row strong.danger { color: #E74C3C; }
.stat-row strong.primary { color: #2E4A8B; }

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top-color: #2E4A8B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  background: #ffe6e6;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-top: 20px;
}

.error-message p {
  color: #E74C3C;
  margin-bottom: 15px;
}

.btn-retry {
  padding: 10px 20px;
  background: #E74C3C;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .pdf-reports-module {
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .modules-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .stat-info h4 {
    font-size: 1.2rem;
  }
}
</style>
