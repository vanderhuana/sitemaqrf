const express = require('express');
const router = express.Router();
const PDFReportController = require('../controllers/pdfReportController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireAdminOrControl } = require('../middleware/roles');

/**
 * @route GET /api/pdf-reports/resumen
 * @desc Obtener resumen general de todos los módulos
 * @access Admin
 */
router.get('/resumen', 
  authenticateToken, 
  requireAdmin, 
  PDFReportController.getResumenGeneral
);

/**
 * @route GET /api/pdf-reports/usuarios
 * @desc Obtener estadísticas de usuarios
 * @access Admin
 */
router.get('/usuarios', 
  authenticateToken, 
  requireAdmin, 
  PDFReportController.getEstadisticasUsuarios
);

/**
 * @route GET /api/pdf-reports/entradas-qr
 * @desc Obtener estadísticas de entradas QR
 * @access Admin
 */
router.get('/entradas-qr', 
  authenticateToken, 
  requireAdmin, 
  PDFReportController.getEstadisticasEntradasQR
);

/**
 * @route GET /api/pdf-reports/trabajadores
 * @desc Obtener estadísticas de trabajadores
 * @access Admin
 */
router.get('/trabajadores', 
  authenticateToken, 
  requireAdmin, 
  PDFReportController.getEstadisticasTrabajadores
);

/**
 * @route GET /api/pdf-reports/participantes
 * @desc Obtener estadísticas de participantes
 * @access Admin
 */
router.get('/participantes', 
  authenticateToken, 
  requireAdmin, 
  PDFReportController.getEstadisticasParticipantes
);

/**
 * @route GET /api/pdf-reports/feipobol
 * @desc Obtener estadísticas de registro FEIPOBOL
 * @access Admin
 */
router.get('/feipobol', 
  authenticateToken, 
  requireAdmin, 
  PDFReportController.getEstadisticasRegistroFeipobol
);

/**
 * @route GET /api/pdf-reports/premios
 * @desc Obtener estadísticas de premios FEIPOBOL
 * @access Admin
 */
router.get('/premios', 
  authenticateToken, 
  requireAdmin, 
  PDFReportController.getEstadisticasPremios
);

/**
 * @route GET /api/pdf-reports/credenciales-vip
 * @desc Obtener estadísticas de credenciales VIP
 * @access Admin
 */
router.get('/credenciales-vip', 
  authenticateToken, 
  requireAdmin, 
  PDFReportController.getEstadisticasCredencialesVIP
);

/**
 * @route GET /api/pdf-reports/generar-pdf
 * @desc Generar y descargar PDF del módulo seleccionado
 * @access Admin
 */
router.get('/generar-pdf', 
  authenticateToken, 
  requireAdmin, 
  PDFReportController.generarPDFCompleto
);

module.exports = router;
