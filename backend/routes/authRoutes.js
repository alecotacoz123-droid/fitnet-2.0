const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  recoverPassword, 
  updateProfile, 
  getProfile, 
  getPublicProfile, 
  followUser, 
  unfollowUser,
  verifyCode,
  resetPassword
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/recover-password', recoverPassword);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);
const upload = require('../utils/uploader');

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, upload.single('profile_picture'), updateProfile);
router.get('/profile/:username', authenticate, getPublicProfile);
router.post('/profile/:id/follow', authenticate, followUser);
router.post('/profile/:id/unfollow', authenticate, unfollowUser);

module.exports = router;
