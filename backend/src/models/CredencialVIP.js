const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CredencialVIP = sequelize.define('CredencialVIP', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.ENUM('VIP', 'SUPER_VIP'),
      allowNull: false,
      defaultValue: 'VIP',
      comment: 'Tipo de credencial VIP'
    },
    token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
      comment: 'Token único para identificación de la credencial'
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Código QR en formato Data URL'
    },
    numeroCredencial: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permitir null temporalmente para el hook
      unique: true,
      comment: 'Número único de credencial VIP (autoincremental)'
    },
    validaciones: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Contador de validaciones realizadas (máximo 2)'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'Estado de la credencial'
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    fechaUltimaValidacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de la última validación'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones o notas sobre la credencial'
    }
  }, {
    tableName: 'credenciales_vip',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['token']
      },
      {
        unique: true,
        fields: ['numeroCredencial']
      },
      {
        fields: ['tipo']
      },
      {
        fields: ['activo']
      },
      {
        fields: ['validaciones']
      }
    ],
    hooks: {
      beforeCreate: async (credencial) => {
        // Generar número de credencial único
        const ultimaCredencial = await CredencialVIP.findOne({
          order: [['numeroCredencial', 'DESC']],
          attributes: ['numeroCredencial']
        });
        
        credencial.numeroCredencial = ultimaCredencial && ultimaCredencial.numeroCredencial 
          ? ultimaCredencial.numeroCredencial + 1 
          : 1; // Empezar desde 1
      }
    }
  });

  return CredencialVIP;
};
