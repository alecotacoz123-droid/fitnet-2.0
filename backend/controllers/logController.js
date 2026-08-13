const { ActivityLog, Notification, Post, Like, Follower, GroupMember, User, Group } = require('../models');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

const getUserLogs = async (req, res) => {
  try {
    const user_id = req.user.id;
    const logs = await ActivityLog.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
      limit: 50
    });
    return res.json(logs);
  } catch (error) {
    console.error('Get User Logs Error:', error);
    return res.status(500).json({ error: 'Error al obtener los logs de actividad.' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const notifications = await Notification.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'username', 'full_name', 'profile_picture']
        },
        {
          model: Post,
          attributes: ['id', 'title']
        },
        {
          model: Group,
          attributes: ['id', 'name']
        }
      ]
    });
    return res.json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    return res.status(500).json({ error: 'Error al obtener notificaciones.' });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    const user_id = req.user.id;
    await Notification.update(
      { is_read: true },
      { where: { user_id, is_read: false } }
    );
    return res.json({ message: 'Notificaciones marcadas como leídas.' });
  } catch (error) {
    console.error('Mark Notifications Error:', error);
    return res.status(500).json({ error: 'Error al actualizar notificaciones.' });
  }
};

const getDashboardMetrics = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Counts
    const postsCount = await Post.count({ where: { user_id } });
    const likesGivenCount = await Like.count({ where: { user_id } });
    const followersCount = await Follower.count({ where: { following_id: user_id } });
    const followingCount = await Follower.count({ where: { follower_id: user_id } });
    const groupsCount = await GroupMember.count({ where: { user_id, status: 'approved' } });

    // Recent activity logs
    const recentLogs = await ActivityLog.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Weekly posts distribution (for Chart.js)
    // We get posts grouped by weekday or last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const postsLast7Days = await Post.findAll({
      where: {
        user_id,
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        [sequelize.fn('date', sequelize.col('created_at')), 'date'],
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('date', sequelize.col('created_at'))],
      order: [[sequelize.fn('date', sequelize.col('created_at')), 'ASC']]
    });

    // Weekly activity distribution (actions logged)
    const logsLast7Days = await ActivityLog.findAll({
      where: {
        user_id,
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        [sequelize.fn('date', sequelize.col('created_at')), 'date'],
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('date', sequelize.col('created_at'))],
      order: [[sequelize.fn('date', sequelize.col('created_at')), 'ASC']]
    });

    // Formatting chart data
    const chartData = {
      posts: postsLast7Days.map(p => ({
        date: p.getDataValue('date'),
        count: p.getDataValue('count')
      })),
      activity: logsLast7Days.map(l => ({
        date: l.getDataValue('date'),
        count: l.getDataValue('count')
      }))
    };

    return res.json({
      metrics: {
        postsCount,
        likesGivenCount,
        followersCount,
        followingCount,
        groupsCount
      },
      recentLogs,
      chartData
    });
  } catch (error) {
    console.error('Get Dashboard Metrics Error:', error);
    return res.status(500).json({ error: 'Error al obtener métricas del dashboard.' });
  }
};

module.exports = {
  getUserLogs,
  getNotifications,
  markNotificationsRead,
  getDashboardMetrics
};
