/**
 * Script para sincronizar la base de datos con los modelos de Sequelize
 * Agrega columnas faltantes sin eliminar datos existentes
 */

const { sequelize } = require('../src/models');

async function syncDatabase() {
  try {
    console.log('🔄 Iniciando sincronización de base de datos...');
    console.log('📝 Esto agregará columnas faltantes sin borrar datos\n');

    // Usar alter: true para modificar tablas existentes sin borrar datos
    await sequelize.sync({ alter: true });

    console.log('\n✅ Base de datos sincronizada correctamente');
    console.log('✅ Todas las columnas de las asociaciones fueron agregadas');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error sincronizando base de datos:', error);
    process.exit(1);
  }
}

syncDatabase();
