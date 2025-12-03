const { Op, fn, col, literal } = require('sequelize');
const PDFDocument = require('pdfkit');

// Importar modelos
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { sequelize } = require('../config/database');
const Trabajador = require('../models/Trabajador')(sequelize);
const Participante = require('../models/Participante')(sequelize);
const Empresa = require('../models/Empresa')(sequelize);
const RegistroFeipobol = require('../models/RegistroFeipobol')(sequelize);
const PremioFeipobol = require('../models/PremioFeipobol')(sequelize);
const CredencialVIP = require('../models/CredencialVIP')(sequelize);

/**
 * Controlador para generar reportes PDF del sistema
 */
class PDFReportController {

  /**
   * Obtener resumen general de todos los módulos
   */
  static async getResumenGeneral(req, res) {
    try {
      const [
        totalUsuarios,
        totalTrabajadores,
        totalParticipantes,
        totalRegistrosFeipobol,
        totalPremios,
        totalCredencialesVIP,
        totalCredencialesSuperVIP,
        totalEntradasQR
      ] = await Promise.all([
        User.count(),
        Trabajador.count(),
        Participante.count(),
        RegistroFeipobol.count(),
        PremioFeipobol.count({ where: { activo: true } }),
        CredencialVIP.count({ where: { tipo: 'VIP' } }),
        CredencialVIP.count({ where: { tipo: 'SUPER_VIP' } }),
        Ticket.count({ where: { status: { [Op.in]: ['active', 'used'] } } })
      ]);

      // Usuarios por rol
      const usuariosPorRol = await User.findAll({
        attributes: ['role', [fn('COUNT', col('id')), 'cantidad']],
        group: ['role'],
        raw: true
      });

      // Credenciales usadas
      const credencialesUsadas = await CredencialVIP.count({
        where: { validaciones: { [Op.gt]: 0 } }
      });

      res.json({
        success: true,
        data: {
          usuarios: {
            total: totalUsuarios,
            porRol: usuariosPorRol
          },
          trabajadores: totalTrabajadores,
          participantes: totalParticipantes,
          registrosFeipobol: totalRegistrosFeipobol,
          premios: totalPremios,
          credenciales: {
            vip: totalCredencialesVIP,
            superVip: totalCredencialesSuperVIP,
            usadas: credencialesUsadas
          },
          entradasQR: totalEntradasQR
        }
      });
    } catch (error) {
      console.error('Error obteniendo resumen general:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo resumen general',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getEstadisticasUsuarios(req, res) {
    try {
      const total = await User.count();
      
      const porRol = await User.findAll({
        attributes: ['role', [fn('COUNT', col('id')), 'cantidad']],
        group: ['role'],
        raw: true
      });

      const activos = await User.count({ where: { isActive: true } });

      const usuarios = await User.findAll({
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          total,
          activos,
          inactivos: total - activos,
          porRol,
          usuarios
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de usuarios',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de entradas QR (Generador de Entradas)
   */
  static async getEstadisticasEntradasQR(req, res) {
    try {
      const total = await Ticket.count();
      
      const porEstado = await Ticket.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'cantidad']],
        group: ['status'],
        raw: true
      });

      const totalVendido = await Ticket.sum('salePrice', {
        where: { status: { [Op.in]: ['active', 'used'] } }
      });

      // Entradas por día (últimos 7 días)
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);

      const porDia = await Ticket.findAll({
        attributes: [
          [fn('DATE', col('sale_date')), 'fecha'],
          [fn('COUNT', col('id')), 'cantidad'],
          [fn('SUM', col('sale_price')), 'total']
        ],
        where: {
          saleDate: { [Op.gte]: hace7Dias }
        },
        group: [fn('DATE', col('sale_date'))],
        order: [[fn('DATE', col('sale_date')), 'ASC']],
        raw: true
      });

      // Resumen de entradas
      const activas = await Ticket.count({ where: { status: 'active' } });
      const usadas = await Ticket.count({ where: { status: 'used' } });
      const canceladas = await Ticket.count({ where: { status: 'cancelled' } });

      res.json({
        success: true,
        data: {
          total,
          activas,
          usadas,
          canceladas,
          totalVendido: totalVendido || 0,
          porEstado,
          porDia
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de entradas QR:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de entradas QR',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de trabajadores
   */
  static async getEstadisticasTrabajadores(req, res) {
    try {
      const total = await Trabajador.count();
      
      // Por área de trabajo
      const porArea = await Trabajador.findAll({
        attributes: ['areaTrabajo', [fn('COUNT', col('id')), 'cantidad']],
        group: ['areaTrabajo'],
        raw: true
      });

      // Por zona
      const porZona = await Trabajador.findAll({
        attributes: ['zona', [fn('COUNT', col('id')), 'cantidad']],
        group: ['zona'],
        raw: true
      });

      // Por sexo
      const porSexo = await Trabajador.findAll({
        attributes: ['sexo', [fn('COUNT', col('id')), 'cantidad']],
        group: ['sexo'],
        raw: true
      });

      // Por estado
      const porEstado = await Trabajador.findAll({
        attributes: ['estado', [fn('COUNT', col('id')), 'cantidad']],
        group: ['estado'],
        raw: true
      });

      // Con acceso registrado
      const conAcceso = await Trabajador.count({
        where: { ultimoAcceso: { [Op.not]: null } }
      });

      res.json({
        success: true,
        data: {
          total,
          conAcceso,
          sinAcceso: total - conAcceso,
          porArea,
          porZona,
          porSexo,
          porEstado
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de trabajadores:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de trabajadores',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de participantes
   */
  static async getEstadisticasParticipantes(req, res) {
    try {
      const total = await Participante.count();
      
      // Por empresa
      const porEmpresa = await Participante.findAll({
        include: [{
          model: Empresa,
          as: 'Empresa',
          attributes: ['id', 'nombre']
        }],
        attributes: ['empresaId', [fn('COUNT', col('Participante.id')), 'cantidad']],
        group: ['Participante.empresaId', 'Empresa.id', 'Empresa.nombre'],
        raw: true
      });

      // Por zona
      const porZona = await Participante.findAll({
        attributes: ['zona', [fn('COUNT', col('id')), 'cantidad']],
        group: ['zona'],
        raw: true
      });

      // Por estado
      const porEstado = await Participante.findAll({
        attributes: ['estado', [fn('COUNT', col('id')), 'cantidad']],
        group: ['estado'],
        raw: true
      });

      // Con acceso registrado
      const conAcceso = await Participante.count({
        where: { ultimoAcceso: { [Op.not]: null } }
      });

      res.json({
        success: true,
        data: {
          total,
          conAcceso,
          sinAcceso: total - conAcceso,
          porEmpresa: porEmpresa.map(p => ({
            empresa: p['Empresa.nombre'] || 'Sin empresa',
            cantidad: parseInt(p.cantidad)
          })),
          porZona,
          porEstado
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de participantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de participantes',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de Registro FEIPOBOL (UATF Derecho)
   */
  static async getEstadisticasRegistroFeipobol(req, res) {
    try {
      const total = await RegistroFeipobol.count();
      
      // Por zona
      const porZona = await RegistroFeipobol.findAll({
        attributes: ['zona', [fn('COUNT', col('id')), 'cantidad']],
        group: ['zona'],
        raw: true
      });

      // Por carrera
      const porCarrera = await RegistroFeipobol.findAll({
        attributes: ['carrera', [fn('COUNT', col('id')), 'cantidad']],
        group: ['carrera'],
        raw: true
      });

      // Por rango de edad
      const hoy = new Date();
      
      // Menores de 20
      const menores20 = await RegistroFeipobol.count({
        where: sequelize.literal(`DATE_PART('year', AGE("fechaNacimiento")) < 20`)
      });

      // 20-25 años
      const entre20y25 = await RegistroFeipobol.count({
        where: sequelize.literal(`DATE_PART('year', AGE("fechaNacimiento")) >= 20 AND DATE_PART('year', AGE("fechaNacimiento")) <= 25`)
      });

      // 26-30 años
      const entre26y30 = await RegistroFeipobol.count({
        where: sequelize.literal(`DATE_PART('year', AGE("fechaNacimiento")) >= 26 AND DATE_PART('year', AGE("fechaNacimiento")) <= 30`)
      });

      // Mayores de 30
      const mayores30 = await RegistroFeipobol.count({
        where: sequelize.literal(`DATE_PART('year', AGE("fechaNacimiento")) > 30`)
      });

      // Con premio
      const conPremio = await RegistroFeipobol.count({
        where: { gano: true }
      });

      res.json({
        success: true,
        data: {
          total,
          conPremio,
          sinPremio: total - conPremio,
          porZona,
          porCarrera,
          porEdad: [
            { rango: 'Menores de 20', cantidad: menores20 },
            { rango: '20-25 años', cantidad: entre20y25 },
            { rango: '26-30 años', cantidad: entre26y30 },
            { rango: 'Mayores de 30', cantidad: mayores30 }
          ]
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de Registro FEIPOBOL:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de Registro FEIPOBOL',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de Premios FEIPOBOL
   */
  static async getEstadisticasPremios(req, res) {
    try {
      const total = await PremioFeipobol.count();
      const activos = await PremioFeipobol.count({ where: { activo: true } });
      
      // Valor total de premios
      const valorTotal = await PremioFeipobol.sum('valorPremio', {
        where: { activo: true }
      });

      // Lista de premios
      const premios = await PremioFeipobol.findAll({
        order: [['numeroSorteo', 'ASC']],
        raw: true
      });

      res.json({
        success: true,
        data: {
          total,
          activos,
          inactivos: total - activos,
          valorTotal: valorTotal || 0,
          premios
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de premios:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de premios',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de Credenciales VIP
   */
  static async getEstadisticasCredencialesVIP(req, res) {
    try {
      const totalVIP = await CredencialVIP.count({ where: { tipo: 'VIP' } });
      const totalSuperVIP = await CredencialVIP.count({ where: { tipo: 'SUPER_VIP' } });
      
      // Activas por tipo
      const vipActivas = await CredencialVIP.count({ where: { tipo: 'VIP', activo: true } });
      const superVipActivas = await CredencialVIP.count({ where: { tipo: 'SUPER_VIP', activo: true } });

      // Usadas (al menos 1 validación)
      const vipUsadas = await CredencialVIP.count({ 
        where: { tipo: 'VIP', validaciones: { [Op.gt]: 0 } } 
      });
      const superVipUsadas = await CredencialVIP.count({ 
        where: { tipo: 'SUPER_VIP', validaciones: { [Op.gt]: 0 } } 
      });

      // Completamente usadas (2 validaciones)
      const vipAgotadas = await CredencialVIP.count({ 
        where: { tipo: 'VIP', validaciones: { [Op.gte]: 2 } } 
      });
      const superVipAgotadas = await CredencialVIP.count({ 
        where: { tipo: 'SUPER_VIP', validaciones: { [Op.gte]: 2 } } 
      });

      // Por número de validaciones
      const porValidaciones = await CredencialVIP.findAll({
        attributes: ['tipo', 'validaciones', [fn('COUNT', col('id')), 'cantidad']],
        group: ['tipo', 'validaciones'],
        order: [['tipo', 'ASC'], ['validaciones', 'ASC']],
        raw: true
      });

      res.json({
        success: true,
        data: {
          vip: {
            total: totalVIP,
            activas: vipActivas,
            usadas: vipUsadas,
            agotadas: vipAgotadas,
            disponibles: totalVIP - vipAgotadas
          },
          superVip: {
            total: totalSuperVIP,
            activas: superVipActivas,
            usadas: superVipUsadas,
            agotadas: superVipAgotadas,
            disponibles: totalSuperVIP - superVipAgotadas
          },
          totalGeneral: totalVIP + totalSuperVIP,
          porValidaciones
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de credenciales VIP:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de credenciales VIP',
        error: error.message
      });
    }
  }

  /**
   * Generar PDF de reporte completo
   */
  static async generarPDFCompleto(req, res) {
    try {
      const { modulo } = req.query;
      
      // Crear documento PDF
      const doc = new PDFDocument({ margin: 50 });
      
      // Configurar headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${modulo || 'general'}_${Date.now()}.pdf`);
      
      doc.pipe(res);

      // Header del documento (sin caracteres especiales)
      doc.fontSize(24).fillColor('#2E4A8B').text('SISTEMA SISQR6', { align: 'center' });
      doc.fontSize(16).fillColor('#333').text('Reporte de Estadisticas', { align: 'center' });
      doc.fontSize(12).fillColor('#666').text(`Generado: ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}`, { align: 'center' });
      doc.moveDown(2);

      // Obtener datos según el módulo
      let datos;
      let titulo;

      switch (modulo) {
        case 'usuarios':
          titulo = 'Reporte de Usuarios';
          datos = await PDFReportController.getDatosUsuarios();
          PDFReportController.agregarSeccionUsuarios(doc, datos);
          break;
          
        case 'entradas':
          titulo = 'Reporte de Entradas QR';
          datos = await PDFReportController.getDatosEntradasQR();
          PDFReportController.agregarSeccionEntradasQR(doc, datos);
          break;
          
        case 'trabajadores':
          titulo = 'Reporte de Trabajadores';
          datos = await PDFReportController.getDatosTrabajadores();
          PDFReportController.agregarSeccionTrabajadores(doc, datos);
          break;
          
        case 'participantes':
          titulo = 'Reporte de Participantes';
          datos = await PDFReportController.getDatosParticipantes();
          PDFReportController.agregarSeccionParticipantes(doc, datos);
          break;
          
        case 'feipobol':
          titulo = 'Reporte de Registro FEIPOBOL';
          datos = await PDFReportController.getDatosRegistroFeipobol();
          PDFReportController.agregarSeccionFeipobol(doc, datos);
          break;
          
        case 'premios':
          titulo = 'Reporte de Premios FEIPOBOL';
          datos = await PDFReportController.getDatosPremios();
          PDFReportController.agregarSeccionPremios(doc, datos);
          break;
          
        case 'credenciales':
          titulo = 'Reporte de Credenciales VIP';
          datos = await PDFReportController.getDatosCredencialesVIP();
          PDFReportController.agregarSeccionCredenciales(doc, datos);
          break;
          
        default:
          titulo = 'Reporte General';
          datos = await PDFReportController.getDatosResumenGeneral();
          PDFReportController.agregarSeccionResumenGeneral(doc, datos);
      }

      // Pie de página
      doc.moveDown(2);
      doc.fontSize(10).fillColor('#999').text('SISQR6 - Sistema de Gestión de Entradas y Registros', { align: 'center' });
      
      doc.end();
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando PDF',
        error: error.message
      });
    }
  }

  // ========== MÉTODOS AUXILIARES PARA OBTENER DATOS ==========

  static async getDatosUsuarios() {
    const total = await User.count();
    const porRol = await User.findAll({
      attributes: ['role', [fn('COUNT', col('id')), 'cantidad']],
      group: ['role'],
      raw: true
    });
    const activos = await User.count({ where: { isActive: true } });
    return { total, activos, inactivos: total - activos, porRol };
  }

  static async getDatosEntradasQR() {
    const total = await Ticket.count();
    const activas = await Ticket.count({ where: { status: 'active' } });
    const usadas = await Ticket.count({ where: { status: 'used' } });
    const canceladas = await Ticket.count({ where: { status: 'cancelled' } });
    const totalVendido = await Ticket.sum('salePrice', {
      where: { status: { [Op.in]: ['active', 'used'] } }
    });
    return { total, activas, usadas, canceladas, totalVendido: totalVendido || 0 };
  }

  static async getDatosTrabajadores() {
    const total = await Trabajador.count();
    const porArea = await Trabajador.findAll({
      attributes: ['areaTrabajo', [fn('COUNT', col('id')), 'cantidad']],
      group: ['areaTrabajo'],
      raw: true
    });
    const conAcceso = await Trabajador.count({
      where: { ultimoAcceso: { [Op.not]: null } }
    });
    return { total, conAcceso, sinAcceso: total - conAcceso, porArea };
  }

  static async getDatosParticipantes() {
    const total = await Participante.count();
    const conAcceso = await Participante.count({
      where: { ultimoAcceso: { [Op.not]: null } }
    });
    return { total, conAcceso, sinAcceso: total - conAcceso };
  }

  static async getDatosRegistroFeipobol() {
    const total = await RegistroFeipobol.count();
    const porZona = await RegistroFeipobol.findAll({
      attributes: ['zona', [fn('COUNT', col('id')), 'cantidad']],
      group: ['zona'],
      raw: true
    });
    return { total, porZona };
  }

  static async getDatosPremios() {
    const total = await PremioFeipobol.count();
    const activos = await PremioFeipobol.count({ where: { activo: true } });
    const valorTotal = await PremioFeipobol.sum('valorPremio', { where: { activo: true } });
    return { total, activos, inactivos: total - activos, valorTotal: valorTotal || 0 };
  }

  static async getDatosCredencialesVIP() {
    const vip = await CredencialVIP.count({ where: { tipo: 'VIP' } });
    const superVip = await CredencialVIP.count({ where: { tipo: 'SUPER_VIP' } });
    const vipUsadas = await CredencialVIP.count({ where: { tipo: 'VIP', validaciones: { [Op.gt]: 0 } } });
    const superVipUsadas = await CredencialVIP.count({ where: { tipo: 'SUPER_VIP', validaciones: { [Op.gt]: 0 } } });
    return { vip, superVip, vipUsadas, superVipUsadas };
  }

  static async getDatosResumenGeneral() {
    return {
      usuarios: await User.count(),
      trabajadores: await Trabajador.count(),
      participantes: await Participante.count(),
      registrosFeipobol: await RegistroFeipobol.count(),
      premios: await PremioFeipobol.count({ where: { activo: true } }),
      credencialesVIP: await CredencialVIP.count({ where: { tipo: 'VIP' } }),
      credencialesSuperVIP: await CredencialVIP.count({ where: { tipo: 'SUPER_VIP' } }),
      entradasQR: await Ticket.count()
    };
  }

  // ========== MÉTODOS PARA AGREGAR SECCIONES AL PDF ==========

  static agregarSeccionUsuarios(doc, datos) {
    doc.fontSize(18).fillColor('#2E4A8B').text('GESTION DE USUARIOS', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12).fillColor('#333');
    doc.text(`Total de usuarios: ${datos.total}`);
    doc.text(`Usuarios activos: ${datos.activos}`);
    doc.text(`Usuarios inactivos: ${datos.inactivos}`);
    doc.moveDown();
    
    doc.fontSize(14).fillColor('#2E4A8B').text('Por Rol:');
    datos.porRol.forEach(item => {
      doc.fontSize(11).fillColor('#333').text(`  - ${item.role}: ${item.cantidad}`);
    });
  }

  static agregarSeccionEntradasQR(doc, datos) {
    doc.fontSize(18).fillColor('#2E4A8B').text('GENERADOR DE ENTRADAS QR', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12).fillColor('#333');
    doc.text(`Total de entradas: ${datos.total}`);
    doc.text(`Activas: ${datos.activas}`);
    doc.text(`Usadas: ${datos.usadas}`);
    doc.text(`Canceladas: ${datos.canceladas}`);
    doc.text(`Total vendido: Bs. ${datos.totalVendido?.toFixed(2) || '0.00'}`);
  }

  static agregarSeccionTrabajadores(doc, datos) {
    doc.fontSize(18).fillColor('#2E4A8B').text('TRABAJADORES', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12).fillColor('#333');
    doc.text(`Total de trabajadores: ${datos.total}`);
    doc.text(`Con acceso registrado: ${datos.conAcceso}`);
    doc.text(`Sin acceso: ${datos.sinAcceso}`);
    doc.moveDown();
    
    if (datos.porArea && datos.porArea.length > 0) {
      doc.fontSize(14).fillColor('#2E4A8B').text('Por Area de Trabajo:');
      datos.porArea.forEach(item => {
        doc.fontSize(11).fillColor('#333').text(`  - ${item.areaTrabajo || 'Sin area'}: ${item.cantidad}`);
      });
    }
  }

  static agregarSeccionParticipantes(doc, datos) {
    doc.fontSize(18).fillColor('#2E4A8B').text('PARTICIPANTES', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12).fillColor('#333');
    doc.text(`Total de participantes: ${datos.total}`);
    doc.text(`Con acceso registrado: ${datos.conAcceso}`);
    doc.text(`Sin acceso: ${datos.sinAcceso}`);
  }

  static agregarSeccionFeipobol(doc, datos) {
    doc.fontSize(18).fillColor('#2E4A8B').text('REGISTRO FEIPOBOL (UATF)', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12).fillColor('#333');
    doc.text(`Total de registros: ${datos.total}`);
    doc.moveDown();
    
    if (datos.porZona && datos.porZona.length > 0) {
      doc.fontSize(14).fillColor('#2E4A8B').text('Por Zona:');
      datos.porZona.forEach(item => {
        doc.fontSize(11).fillColor('#333').text(`  - ${item.zona || 'Sin zona'}: ${item.cantidad}`);
      });
    }
  }

  static agregarSeccionPremios(doc, datos) {
    doc.fontSize(18).fillColor('#2E4A8B').text('PREMIOS FEIPOBOL', { underline: true });
    doc.moveDown();
    
    doc.fontSize(12).fillColor('#333');
    doc.text(`Total de premios: ${datos.total}`);
    doc.text(`Premios activos: ${datos.activos}`);
    doc.text(`Premios inactivos: ${datos.inactivos}`);
    doc.text(`Valor total: Bs. ${datos.valorTotal?.toFixed(2) || '0.00'}`);
  }

  static agregarSeccionCredenciales(doc, datos) {
    doc.fontSize(18).fillColor('#2E4A8B').text('CREDENCIALES VIP', { underline: true });
    doc.moveDown();
    
    doc.fontSize(14).fillColor('#E74C3C').text('VIP:');
    doc.fontSize(12).fillColor('#333');
    doc.text(`  Total: ${datos.vip}`);
    doc.text(`  Usadas: ${datos.vipUsadas}`);
    doc.text(`  Disponibles: ${datos.vip - datos.vipUsadas}`);
    doc.moveDown();
    
    doc.fontSize(14).fillColor('#F1C40F').text('SUPER VIP:');
    doc.fontSize(12).fillColor('#333');
    doc.text(`  Total: ${datos.superVip}`);
    doc.text(`  Usadas: ${datos.superVipUsadas}`);
    doc.text(`  Disponibles: ${datos.superVip - datos.superVipUsadas}`);
  }

  static agregarSeccionResumenGeneral(doc, datos) {
    doc.fontSize(18).fillColor('#2E4A8B').text('RESUMEN GENERAL DEL SISTEMA', { underline: true });
    doc.moveDown();
    
    const items = [
      { label: 'Usuarios', value: datos.usuarios },
      { label: 'Trabajadores', value: datos.trabajadores },
      { label: 'Participantes', value: datos.participantes },
      { label: 'Registros FEIPOBOL', value: datos.registrosFeipobol },
      { label: 'Premios Activos', value: datos.premios },
      { label: 'Entradas QR', value: datos.entradasQR },
      { label: 'Credenciales VIP', value: datos.credencialesVIP },
      { label: 'Credenciales SUPER VIP', value: datos.credencialesSuperVIP }
    ];
    
    items.forEach(item => {
      doc.fontSize(12).fillColor('#333').text(`${item.label}: ${item.value}`);
    });
  }
}

module.exports = PDFReportController;
