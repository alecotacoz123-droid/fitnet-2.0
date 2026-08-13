const { User, Post, Group, ActivityLog } = require('../models');
const { logActivity } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'full_name', 'role', 'bio', 'profile_picture', 'created_at']
    });
    return res.json(users);
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    return res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'trainer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logActivity(req.user.id, 'ADMIN_CHANGE_ROLE', `Rol de usuario ${user.username} cambiado de ${oldRole} a ${role}`, req);

    return res.json({ message: 'Rol de usuario actualizado exitosamente.', user });
  } catch (error) {
    console.error('Admin Update Role Error:', error);
    return res.status(500).json({ error: 'Error al cambiar el rol.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de administrador desde aquí.' });
    }

    const username = user.username;
    await user.destroy();

    await logActivity(req.user.id, 'ADMIN_DELETE_USER', `Usuario eliminado: ${username}`, req);

    return res.json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('Admin Delete User Error:', error);
    return res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    const title = post.title;
    const authorId = post.user_id;
    await post.destroy();

    await logActivity(req.user.id, 'ADMIN_MODERATE_POST', `Publicación eliminada: "${title}" (Autor ID: ${authorId})`, req);

    return res.json({ message: 'Publicación eliminada por moderación.' });
  } catch (error) {
    console.error('Admin Delete Post Error:', error);
    return res.status(500).json({ error: 'Error al moderar la publicación.' });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalPosts = await Post.count();
    const totalGroups = await Group.count();

    const systemLogs = await ActivityLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 30,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'role']
        }
      ]
    });

    return res.json({
      stats: {
        totalUsers,
        totalPosts,
        totalGroups
      },
      systemLogs
    });
  } catch (error) {
    console.error('Admin Get Stats Error:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas del sistema.' });
  }
};

const triggerBackup = async (req, res) => {
  try {
    const storageSetting = process.env.DB_STORAGE || '../database/fitnet.sqlite';
    const dbPath = path.resolve(__dirname, '..', storageSetting);

    if (!fs.existsSync(dbPath)) {
      return res.status(400).json({ error: 'La base de datos SQLite no existe para hacer backup.' });
    }

    const backupsDir = path.resolve(__dirname, '..', '../database/backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `fitnet_backup_${timestamp}.sqlite`;
    const backupPath = path.join(backupsDir, backupFileName);

    fs.copyFileSync(dbPath, backupPath);

    await logActivity(req.user.id, 'SYSTEM_BACKUP', `Copia de seguridad realizada: ${backupFileName}`, req);

    return res.json({ 
      message: 'Copia de seguridad del sistema realizada con éxito.',
      backupFile: backupFileName
    });
  } catch (error) {
    console.error('Admin Backup Error:', error);
    return res.status(500).json({ error: 'Error al realizar copia de seguridad.' });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  deletePost,
  getSystemStats,
  triggerBackup
};
