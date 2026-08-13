const { Notification } = require('../models');

/**
 * Crea una notificación para un usuario.
 * @param {string} userId ID del usuario destinatario
 * @param {string} senderId ID del usuario que provoca la acción
 * @param {string} type Tipo de notificación ('like', 'comment', 'follow', 'group_join', 'group_approve')
 * @param {string|null} [postId] ID de la publicación relacionada
 * @param {string|null} [groupId] ID del grupo relacionado
 */
const createNotification = async (userId, senderId, type, postId = null, groupId = null) => {
  try {
    // Evitar auto-notificaciones
    if (userId === senderId) return;

    await Notification.create({
      user_id: userId,
      sender_id: senderId,
      type,
      post_id: postId,
      group_id: groupId,
      is_read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = { createNotification };
