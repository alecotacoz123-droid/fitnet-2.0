const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const fitnessController = require('../controllers/fitnessController');

router.post('/profile', authenticate, fitnessController.upsertProfile);
router.get('/profile', authenticate, fitnessController.getProfile);

router.post('/progress', authenticate, fitnessController.logProgress);
router.get('/progress', authenticate, fitnessController.getProgressLogs);

router.get('/plan', authenticate, fitnessController.getTrainingPlan);
router.get('/insights', authenticate, fitnessController.getInsights);

router.post('/sessions', authenticate, fitnessController.saveTrainingSession);
router.get('/sessions', authenticate, fitnessController.getTrainingSessions);

router.get('/calendar', authenticate, fitnessController.getCalendarEvents);
router.post('/calendar/:id/complete', authenticate, fitnessController.markCalendarEvent);
router.get('/stats', authenticate, fitnessController.getStats);

router.post('/survey', authenticate, fitnessController.submitSurveyResponse);
router.get('/survey/results', authenticate, fitnessController.getSurveyResults);

module.exports = router;
