const { CredencialVIP } = require('../models');
const { generateUniqueQRCode, generateVIPCredentialImage } = require('../utils/qrUtils');
const { Op } = require('sequelize');

module.exports = {
  // Crear nueva credencial VIP
  async crear(req, res) {
    try {
      const { tipo, observaciones } = req.body;

      // Validar tipo
      if (!['VIP', 'SUPER_VIP'].includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de credencial inválido. Debe ser VIP o SUPER_VIP'
        });
      }

      // Generar QR único
      const qrCode = generateUniqueQRCode(null, 'credencial-vip');

      // Crear credencial
      const credencial = await CredencialVIP.create({
        tipo,
        qrCode,
        observaciones: observaciones || null
      });

      res.status(201).json({
        success: true,
        message: `Credencial ${tipo} creada exitosamente`,
        credencial
      });

    } catch (error) {
      console.error('Error creando credencial VIP:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Listar todas las credenciales VIP
  async listar(req, res) {
    try {
      const { tipo, activo } = req.query;

      const where = {};
      if (tipo) where.tipo = tipo;
      if (activo !== undefined) where.activo = activo === 'true';

      const credenciales = await CredencialVIP.findAll({
        where,
        order: [['fechaCreacion', 'DESC']]
      });

      // Estadísticas
      const stats = {
        total: credenciales.length,
        vip: credenciales.filter(c => c.tipo === 'VIP').length,
        superVip: credenciales.filter(c => c.tipo === 'SUPER_VIP').length,
        activas: credenciales.filter(c => c.activo).length,
        inactivas: credenciales.filter(c => !c.activo).length,
        conValidaciones: credenciales.filter(c => c.validaciones > 0).length
      };

      res.json({
        success: true,
        credenciales,
        stats
      });

    } catch (error) {
      console.error('Error listando credenciales VIP:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener credencial por ID o token
  async obtener(req, res) {
    try {
      const { id } = req.params;

      // Intentar buscar por ID primero, luego por token si parece UUID
      let credencial = await CredencialVIP.findByPk(id);
      
      if (!credencial && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        credencial = await CredencialVIP.findOne({
          where: { token: id }
        });
      }

      if (!credencial) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      res.json({
        success: true,
        credencial
      });

    } catch (error) {
      console.error('Error obteniendo credencial VIP:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Consultar credencial VIP sin validar (solo mostrar info)
  async consultar(req, res) {
    try {
      console.log('🔍 ===== CONSULTA CREDENCIAL VIP (SIN VALIDAR) =====')
      console.log('🔍 Timestamp:', new Date().toISOString())
      console.log('🔍 Request body:', req.body)
      
      const { token } = req.body;

      if (!token) {
        console.log('❌ Token no proporcionado')
        return res.status(400).json({
          success: false,
          message: 'Token de credencial requerido'
        });
      }

      console.log('🔍 Buscando credencial con token:', token)

      // Buscar por qrCode primero (formato TK-...), luego por token UUID si falla
      let credencial = await CredencialVIP.findOne({
        where: { qrCode: token }
      });

      // Si no se encontró por qrCode, intentar por token UUID (solo si parece UUID)
      if (!credencial && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
        credencial = await CredencialVIP.findOne({
          where: { token }
        });
      }

      if (!credencial) {
        console.log('❌ Credencial no encontrada')
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      console.log('✅ Credencial encontrada:', {
        id: credencial.id,
        numeroCredencial: credencial.numeroCredencial,
        validaciones_actuales: credencial.validaciones,
        activo: credencial.activo
      })

      // Verificar si está activa
      if (!credencial.activo) {
        console.log('⚠️ Credencial desactivada')
        return res.json({
          success: false,
          message: 'Credencial desactivada',
          puedeValidar: false,
          razon: 'DESACTIVADA',
          credencial
        });
      }

      // Verificar número de validaciones
      if (credencial.validaciones >= 2) {
        console.log('⚠️ Límite de validaciones alcanzado (ya tiene', credencial.validaciones, 'validaciones)')
        return res.json({
          success: false,
          message: 'Límite de validaciones alcanzado',
          puedeValidar: false,
          razon: 'LIMITE_ALCANZADO',
          validaciones: credencial.validaciones,
          credencial
        });
      }

      // Si llegó aquí, puede validar
      console.log('✅ Credencial válida y disponible para validar')
      console.log('🔍 ===== FIN CONSULTA =====')

      res.json({
        success: true,
        message: `Credencial lista para validar - Uso ${credencial.validaciones}/2`,
        puedeValidar: true,
        validaciones: credencial.validaciones,
        credencial
      });

    } catch (error) {
      console.error('Error consultando credencial VIP:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Validar credencial VIP (escaneo QR)
  async validar(req, res) {
    try {
      console.log('🔵 ===== INICIO VALIDACIÓN VIP =====')
      console.log('🔵 Timestamp:', new Date().toISOString())
      console.log('🔵 Request body:', req.body)
      
      const { token } = req.body;

      if (!token) {
        console.log('❌ Token no proporcionado')
        return res.status(400).json({
          success: false,
          message: 'Token de credencial requerido'
        });
      }

      console.log('🔍 Buscando credencial con token:', token)

      // Buscar por qrCode primero (formato TK-...), luego por token UUID si falla
      let credencial = await CredencialVIP.findOne({
        where: { qrCode: token }
      });

      // Si no se encontró por qrCode, intentar por token UUID (solo si parece UUID)
      if (!credencial && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
        credencial = await CredencialVIP.findOne({
          where: { token }
        });
      }

      if (!credencial) {
        console.log('❌ Credencial no encontrada')
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      console.log('✅ Credencial encontrada:', {
        id: credencial.id,
        numeroCredencial: credencial.numeroCredencial,
        validaciones_antes: credencial.validaciones
      })

      if (!credencial.activo) {
        console.log('⚠️ Credencial desactivada')
        return res.status(400).json({
          success: false,
          message: 'Credencial desactivada',
          credencial
        });
      }

      // Verificar número de validaciones
      if (credencial.validaciones >= 2) {
        console.log('⚠️ Límite de validaciones alcanzado (ya tiene', credencial.validaciones, 'validaciones)')
        return res.status(400).json({
          success: false,
          message: 'Límite de validaciones alcanzado',
          alerta: true,
          validaciones: credencial.validaciones,
          credencial
        });
      }

      // Incrementar contador de validaciones
      console.log('➕ Incrementando validaciones desde', credencial.validaciones, 'a', credencial.validaciones + 1)
      credencial.validaciones += 1;
      credencial.fechaUltimaValidacion = new Date();
      await credencial.save();
      
      console.log('✅ Credencial guardada con', credencial.validaciones, 'validaciones')

      // Verificar si es la segunda validación (próxima será la tercera)
      const esUltimaValidacion = credencial.validaciones === 2;

      console.log('🔵 ===== FIN VALIDACIÓN VIP =====')
      console.log('🔵 Resultado: success=true, validaciones=', credencial.validaciones)

      res.json({
        success: true,
        message: `Validación ${credencial.validaciones}/2 exitosa`,
        advertencia: esUltimaValidacion,
        validaciones: credencial.validaciones,
        credencial
      });

    } catch (error) {
      console.error('Error validando credencial VIP:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Activar/Desactivar credencial
  async toggleActivo(req, res) {
    try {
      const { id } = req.params;

      const credencial = await CredencialVIP.findByPk(id);

      if (!credencial) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      credencial.activo = !credencial.activo;
      await credencial.save();

      res.json({
        success: true,
        message: `Credencial ${credencial.activo ? 'activada' : 'desactivada'} exitosamente`,
        credencial
      });

    } catch (error) {
      console.error('Error cambiando estado de credencial VIP:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Eliminar credencial
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const credencial = await CredencialVIP.findByPk(id);

      if (!credencial) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      await credencial.destroy();

      res.json({
        success: true,
        message: 'Credencial eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando credencial VIP:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Resetear contador de validaciones
  async resetearValidaciones(req, res) {
    try {
      const { id } = req.params;

      const credencial = await CredencialVIP.findByPk(id);

      if (!credencial) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      credencial.validaciones = 0;
      credencial.fechaUltimaValidacion = null;
      await credencial.save();

      res.json({
        success: true,
        message: 'Contador de validaciones reseteado exitosamente',
        credencial
      });

    } catch (error) {
      console.error('Error reseteando validaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Generar imagen de credencial VIP para descargar/imprimir
  async generarImagen(req, res) {
    try {
      const { id } = req.params;

      const credencial = await CredencialVIP.findByPk(id);

      if (!credencial) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      // Generar la imagen con el diseño personalizado
      const imageBuffer = await generateVIPCredentialImage(credencial, {
        templateType: credencial.tipo,
        qrSize: 650,
        qrY: 1020,
        showNumber: true, // Mostrar el número en la imagen
        numeroCredencial: credencial.numeroCredencial,
        numberY: 1700 // Posición debajo del QR (QR está en 1020, con tamaño 650 termina en ~1670)
      });

      // Formatear número de credencial con ceros a la izquierda (00001)
      const numeroFormateado = String(credencial.numeroCredencial).padStart(5, '0');
      const tipoAbreviado = credencial.tipo === 'SUPER_VIP' ? 'SUPERVIP' : 'VIP';

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="credencial-${tipoAbreviado}-${numeroFormateado}.png"`);
      
      // Enviar la imagen
      res.send(imageBuffer);

    } catch (error) {
      console.error('Error generando imagen de credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar imagen de credencial',
        error: error.message
      });
    }
  }
};
