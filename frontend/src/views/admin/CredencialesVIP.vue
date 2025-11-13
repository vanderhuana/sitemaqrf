<template>
  <div class="credenciales-vip">
    <div class="header-section">
      <h1>🎖️ Credenciales VIP</h1>
      <p class="descripcion">Generación y gestión de credenciales VIP y SUPER VIP para FEIPOBOL 2025</p>
    </div>

    <!-- Estadísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎫</div>
        <div class="stat-info">
          <h3>{{ stats.total || 0 }}</h3>
          <p>Total Credenciales</p>
        </div>
      </div>
      
      <div class="stat-card vip">
        <div class="stat-icon">🌟</div>
        <div class="stat-info">
          <h3>{{ stats.vip || 0 }}</h3>
          <p>VIP</p>
        </div>
      </div>
      
      <div class="stat-card super-vip">
        <div class="stat-icon">💎</div>
        <div class="stat-info">
          <h3>{{ stats.superVip || 0 }}</h3>
          <p>SUPER VIP</p>
        </div>
      </div>
      
      <div class="stat-card activas">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>{{ stats.activas || 0 }}</h3>
          <p>Activas</p>
        </div>
      </div>
    </div>

    <!-- Controles -->
    <div class="controles">
      <button @click="mostrarModalCrear = true" class="btn-crear">
        ➕ Crear Nueva Credencial
      </button>
      
      <div class="filtros">
        <select v-model="filtroTipo" class="select-filtro">
          <option value="">Todos los tipos</option>
          <option value="VIP">🌟 VIP</option>
          <option value="SUPER_VIP">💎 SUPER VIP</option>
        </select>
        
        <select v-model="filtroActivo" class="select-filtro">
          <option value="">Todos los estados</option>
          <option value="true">✅ Activas</option>
          <option value="false">❌ Inactivas</option>
        </select>
        
        <input 
          v-model="busqueda" 
          type="text" 
          placeholder="Buscar por número..." 
          class="input-busqueda"
        />
      </div>
    </div>

    <!-- Tabla de credenciales -->
    <div class="tabla-container">
      <table class="tabla-credenciales">
        <thead>
          <tr>
            <th>N° Credencial</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Validaciones</th>
            <th>Fecha Creación</th>
            <th>Última Validación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="credencial in credencialesFiltradas" :key="credencial.id" class="fila-credencial">
            <td class="numero-credencial">
              <span class="badge-numero">#{{ credencial.numeroCredencial }}</span>
            </td>
            <td class="tipo-credencial">
              <span :class="['badge-tipo', credencial.tipo.toLowerCase()]">
                {{ credencial.tipo === 'VIP' ? '🌟 VIP' : '💎 SUPER VIP' }}
              </span>
            </td>
            <td class="estado">
              <span :class="['badge-estado', credencial.activo ? 'activo' : 'inactivo']">
                {{ credencial.activo ? '✅ Activa' : '❌ Inactiva' }}
              </span>
            </td>
            <td class="validaciones">
              <span :class="['badge-validaciones', getValidacionesClass(credencial.validaciones)]">
                {{ credencial.validaciones }}/2
              </span>
            </td>
            <td class="fecha">
              {{ formatearFecha(credencial.fechaCreacion) }}
            </td>
            <td class="fecha">
              {{ credencial.fechaUltimaValidacion ? formatearFecha(credencial.fechaUltimaValidacion) : '-' }}
            </td>
            <td class="acciones">
              <div class="botones-accion">
                <button 
                  @click="descargarCredencial(credencial)" 
                  class="btn-descargar"
                  title="Descargar credencial"
                >
                  💾
                </button>
                
                <button 
                  @click="toggleActivo(credencial)" 
                  class="btn-toggle"
                  :title="credencial.activo ? 'Desactivar' : 'Activar'"
                >
                  {{ credencial.activo ? '🔴' : '🟢' }}
                </button>
                
                <button 
                  v-if="credencial.validaciones > 0"
                  @click="resetearValidaciones(credencial)" 
                  class="btn-reset"
                  title="Resetear validaciones"
                >
                  🔄
                </button>
                
                <button 
                  @click="eliminarCredencial(credencial)" 
                  class="btn-eliminar"
                  title="Eliminar credencial"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="credencialesFiltradas.length === 0" class="sin-resultados">
        <p>No hay credenciales para mostrar</p>
      </div>
    </div>

    <!-- Modal Crear Credencial -->
    <div v-if="mostrarModalCrear" class="modal-overlay" @click.self="cerrarModalCrear">
      <div class="modal-crear">
        <div class="modal-header">
          <h3>Crear Nueva Credencial</h3>
          <button @click="cerrarModalCrear" class="btn-cerrar">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Tipo de Credencial</label>
            <div class="tipo-options">
              <button 
                @click="formCredencial.tipo = 'VIP'"
                :class="['tipo-option', { selected: formCredencial.tipo === 'VIP' }]"
              >
                <span class="icono">🌟</span>
                <span class="nombre">VIP</span>
              </button>
              
              <button 
                @click="formCredencial.tipo = 'SUPER_VIP'"
                :class="['tipo-option', { selected: formCredencial.tipo === 'SUPER_VIP' }]"
              >
                <span class="icono">💎</span>
                <span class="nombre">SUPER VIP</span>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label>Observaciones (opcional)</label>
            <textarea 
              v-model="formCredencial.observaciones" 
              rows="3"
              placeholder="Agregar notas o comentarios sobre esta credencial..."
              class="form-control"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="cerrarModalCrear" class="btn-cancelar">
            Cancelar
          </button>
          <button @click="crearCredencial" :disabled="!formCredencial.tipo || guardando" class="btn-guardar">
            {{ guardando ? 'Creando...' : 'Crear Credencial' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { credencialesVIPService } from '@/services/api'

const credenciales = ref([])
const stats = ref({})
const mostrarModalCrear = ref(false)
const guardando = ref(false)
const busqueda = ref('')
const filtroTipo = ref('')
const filtroActivo = ref('')

const formCredencial = reactive({
  tipo: 'VIP',
  observaciones: ''
})

// Computed
const credencialesFiltradas = computed(() => {
  let resultado = credenciales.value

  if (filtroTipo.value) {
    resultado = resultado.filter(c => c.tipo === filtroTipo.value)
  }

  if (filtroActivo.value !== '') {
    const activo = filtroActivo.value === 'true'
    resultado = resultado.filter(c => c.activo === activo)
  }

  if (busqueda.value) {
    const busq = busqueda.value.toLowerCase()
    resultado = resultado.filter(c => 
      c.numeroCredencial.toString().includes(busq)
    )
  }

  return resultado
})

// Funciones
const cargarCredenciales = async () => {
  const response = await credencialesVIPService.listar()
  if (response.success) {
    credenciales.value = response.credenciales
    stats.value = response.stats
  }
}

const crearCredencial = async () => {
  guardando.value = true
  
  const response = await credencialesVIPService.crear(
    formCredencial.tipo,
    formCredencial.observaciones
  )
  
  if (response.success) {
    alert(`✅ Credencial ${formCredencial.tipo} creada exitosamente`)
    cerrarModalCrear()
    await cargarCredenciales()
  } else {
    alert(`❌ Error: ${response.error}`)
  }
  
  guardando.value = false
}

const descargarCredencial = async (credencial) => {
  try {
    // Usar el nuevo endpoint del backend que genera la imagen con el diseño personalizado
    const response = await credencialesVIPService.descargarImagen(credencial.id)
    if (response.success) {
      console.log('✅ Credencial descargada exitosamente')
    } else {
      alert(`❌ Error: ${response.error}`)
    }
  } catch (error) {
    console.error('Error descargando credencial:', error)
    alert('❌ Error al descargar la credencial')
  }
}

const toggleActivo = async (credencial) => {
  const response = await credencialesVIPService.toggleActivo(credencial.id)
  if (response.success) {
    await cargarCredenciales()
  } else {
    alert(`❌ Error: ${response.error}`)
  }
}

const resetearValidaciones = async (credencial) => {
  if (!confirm('¿Resetear el contador de validaciones?')) return
  
  const response = await credencialesVIPService.resetearValidaciones(credencial.id)
  if (response.success) {
    alert('✅ Contador reseteado exitosamente')
    await cargarCredenciales()
  } else {
    alert(`❌ Error: ${response.error}`)
  }
}

const eliminarCredencial = async (credencial) => {
  if (!confirm(`¿Eliminar credencial #${credencial.numeroCredencial}?`)) return
  
  const response = await credencialesVIPService.eliminar(credencial.id)
  if (response.success) {
    alert('✅ Credencial eliminada exitosamente')
    await cargarCredenciales()
  } else {
    alert(`❌ Error: ${response.error}`)
  }
}

const cerrarModalCrear = () => {
  mostrarModalCrear.value = false
  formCredencial.tipo = 'VIP'
  formCredencial.observaciones = ''
}

const getValidacionesClass = (validaciones) => {
  if (validaciones === 0) return 'sin-validar'
  if (validaciones === 1) return 'medio'
  return 'completo'
}

const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  cargarCredenciales()
})
</script>

<style scoped>
.credenciales-vip {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 30px;
}

.header-section h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.descripcion {
  color: #7f8c8d;
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-card.vip {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: white;
}

.stat-card.super-vip {
  background: linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%);
  color: #333;
}

.stat-card.activas {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info h3 {
  font-size: 2rem;
  margin: 0;
}

.stat-info p {
  margin: 5px 0 0 0;
  opacity: 0.9;
}

.controles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-crear {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-crear:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.filtros {
  display: flex;
  gap: 10px;
  flex: 1;
  justify-content: flex-end;
}

.select-filtro,
.input-busqueda {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.input-busqueda {
  width: 250px;
}

.tabla-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabla-credenciales {
  width: 100%;
  border-collapse: collapse;
}

.tabla-credenciales thead {
  background: #f8f9fa;
}

.tabla-credenciales th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
}

.tabla-credenciales td {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.fila-credencial:hover {
  background: #f8f9fa;
}

.badge-numero {
  background: #667eea;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.badge-tipo {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.badge-tipo.vip {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: white;
}

.badge-tipo.super_vip {
  background: linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%);
  color: #333;
}

.badge-estado {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.badge-estado.activo {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-estado.inactivo {
  background: #ffebee;
  color: #c62828;
}

.badge-validaciones {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.badge-validaciones.sin-validar {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-validaciones.medio {
  background: #fff3e0;
  color: #f57c00;
}

.badge-validaciones.completo {
  background: #ffebee;
  color: #c62828;
}

.botones-accion {
  display: flex;
  gap: 8px;
}

.botones-accion button {
  background: none;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.botones-accion button:hover {
  transform: scale(1.1);
  border-color: #667eea;
}

.sin-resultados {
  padding: 40px;
  text-align: center;
  color: #7f8c8d;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-crear {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 25px;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.btn-cerrar {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cerrar:hover {
  background: rgba(255,255,255,0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.tipo-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.tipo-option {
  background: white;
  border: 3px solid #e0e0e0;
  border-radius: 12px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.tipo-option:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.tipo-option.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.tipo-option .icono {
  font-size: 3rem;
}

.tipo-option .nombre {
  font-weight: 700;
  font-size: 1.2rem;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancelar,
.btn-guardar {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-cancelar {
  background: #e0e0e0;
  color: #2c3e50;
}

.btn-cancelar:hover {
  background: #d0d0d0;
}

.btn-guardar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-guardar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .credenciales-vip {
    padding: 15px;
  }
  
  .controles {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filtros {
    flex-direction: column;
  }
  
  .input-busqueda {
    width: 100%;
  }
  
  .tabla-container {
    overflow-x: auto;
  }
  
  .tipo-options {
    grid-template-columns: 1fr;
  }
}
</style>
