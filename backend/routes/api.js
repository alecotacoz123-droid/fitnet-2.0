const express = require('express');
const router = express.Router();

// Import advanced modular routes
const authRoutes = require('./authRoutes');
const postRoutes = require('./postRoutes');
const groupRoutes = require('./groupRoutes');
const logRoutes = require('./logRoutes');
const adminRoutes = require('./adminRoutes');
const chatbotCtrl = require('../controllers/chatbotController');

const fitnessRoutes = require('./fitnessRoutes');
const aiCoachRoutes = require('./aiCoachRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/groups', groupRoutes);
router.use('/logs', logRoutes);
router.use('/admin', adminRoutes);
router.use('/fitness', fitnessRoutes);
router.use('/ai-coach', aiCoachRoutes);

const { authenticate } = require('../middleware/auth');

// Chatbot proxy
router.post('/chatbot', authenticate, chatbotCtrl.chat);

module.exports = router;
