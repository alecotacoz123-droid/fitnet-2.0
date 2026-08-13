const { ActivityLog } = require('../models');

/**
 * Registra una acción de usuario en la base de datos.
 * @param {string|null} userId ID del usuario (o null si es anónimo)
 * @param {string} action Nombre de la acción (ej. 'LOGIN', 'CREATE_POST')
 * @param {string|object} details Detalles adicionales de la acción
 * @param {object} [req] Objeto Request de Express para capturar IP
 */
const logActivity = async (userId, action, details, req = null) => {
  try {
    let ipAddress = null;
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    }
    
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;

    await ActivityLog.create({
      user_id: userId,
      action,
      details: detailsStr,
      ip_address: ipAddress
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };
