const express = require('express');
const router = express.Router();
const credencialVIPController = require('../controllers/credencialVIPController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// POST /api/credenciales-vip/consultar - Consultar credencial SIN validar (solo info)
// Permitido para admin y control
router.post('/consultar', authorizeRoles('admin', 'control'), credencialVIPController.consultar);

// POST /api/credenciales-vip/validar - Validar credencial (escaneo QR)
// Permitido para admin y control
router.post('/validar', authorizeRoles('admin', 'control'), credencialVIPController.validar);

// --- Rutas solo para ADMIN ---

// POST /api/credenciales-vip - Crear nueva credencial
router.post('/', authorizeRoles('admin'), credencialVIPController.crear);

// GET /api/credenciales-vip - Listar todas las credenciales
router.get('/', authorizeRoles('admin'), credencialVIPController.listar);

// GET /api/credenciales-vip/:id - Obtener credencial por ID o token
router.get('/:id', authorizeRoles('admin'), credencialVIPController.obtener);

// GET /api/credenciales-vip/:id/imagen - Generar y descargar imagen de credencial
router.get('/:id/imagen', authorizeRoles('admin'), credencialVIPController.generarImagen);

// PUT /api/credenciales-vip/:id/toggle - Activar/Desactivar credencial
router.put('/:id/toggle', authorizeRoles('admin'), credencialVIPController.toggleActivo);

// PUT /api/credenciales-vip/:id/reset - Resetear contador de validaciones
router.put('/:id/reset', authorizeRoles('admin'), credencialVIPController.resetearValidaciones);

// DELETE /api/credenciales-vip/:id - Eliminar credencial
router.delete('/:id', authorizeRoles('admin'), credencialVIPController.eliminar);

module.exports = router;
