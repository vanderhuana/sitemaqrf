const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Validar que exista la variable de entorno JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // En desarrollo podemos permitir un valor por defecto para facilitar testing,
  // pero en producción debemos advertir claramente en los logs.
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: JWT_SECRET no está configurado en el entorno. Esto causará errores al generar/verificar tokens.');
  } else {
    console.warn('JWT_SECRET no definido - usando secreto temporal para desarrollo. No usar en producción.');
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_not_for_prod';
  }
}

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 authenticateToken - Ruta:', req.method, req.originalUrl);
    
    // Obtener el token del header Authorization O del query parameter (para descargas PDF)
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // Si no hay token en header, intentar obtenerlo del query parameter
    if (!token && req.query.token) {
      token = req.query.token;
      console.log('🔑 Token obtenido de query parameter');
    }
    
    console.log('🔑 Token presente:', !!token);
    
    if (!token) {
      console.log('❌ No hay token');
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado - userId:', decoded.userId, 'role:', decoded.role);
    
    // Buscar el usuario en la base de datos
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      console.log('❌ Usuario no encontrado en BD');
      return res.status(401).json({
        error: 'Usuario no encontrado',
        message: 'El token es válido pero el usuario no existe'
      });
    }
    
    console.log('👤 Usuario encontrado:', user.username, 'rol:', user.role);
    
    if (!user.isActive) {
      console.log('❌ Usuario inactivo');
      return res.status(403).json({
        error: 'Usuario inactivo',
        message: 'Tu cuenta ha sido desactivada'
      });
    }
    
    // Agregar información del usuario a la request
    req.user = user;
    console.log('✅ authenticateToken - Pasando al siguiente middleware');
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, inicia sesión nuevamente'
      });
    }
    
    console.error('Error en autenticación:', error);
    return res.status(500).json({
      error: 'Error interno',
      message: 'Error verificando la autenticación'
    });
  }
};

// Middleware opcional - no falla si no hay token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // En auth opcional, continuamos aunque haya error
    next();
  }
};

// Función para generar token JWT
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };
  
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no configurado');
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Función para generar refresh token (duracion más larga)
const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh'
  };
  
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no configurado');
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d' // 7 días
  });
};

// Middleware para autorizar roles específicos
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('🔒 authorizeRoles - Verificando roles permitidos:', allowedRoles);
    console.log('👤 Usuario actual:', req.user?.username, 'rol:', req.user?.role);
    
    if (!req.user) {
      console.log('❌ No hay usuario en request');
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`❌ Rol ${req.user.role} no está en [${allowedRoles.join(', ')}]`);
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Este recurso requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
      });
    }

    console.log('✅ authorizeRoles - Usuario autorizado');
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeRoles,
  generateToken,
  generateRefreshToken
};