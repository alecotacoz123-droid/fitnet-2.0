const express = require('express');
const router = express.Router();
const { 
  getUserLogs, 
  getNotifications, 
  markNotificationsRead, 
  getDashboardMetrics 
} = require('../controllers/logController');
const { authenticate } = require('../middleware/auth');

router.get('/activity', authenticate, getUserLogs);
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/read', authenticate, markNotificationsRead);
router.get('/metrics', authenticate, getDashboardMetrics);

module.exports = router;
