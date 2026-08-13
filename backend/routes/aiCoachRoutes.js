const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const aiCoachController = require('../controllers/aiCoachController');

router.get('/dashboard', authenticate, aiCoachController.getDashboardData);

module.exports = router;
