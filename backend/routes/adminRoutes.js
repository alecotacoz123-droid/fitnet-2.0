const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  deletePost, 
  getSystemStats, 
  triggerBackup 
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.put('/users/:id/role', authenticate, authorize('admin'), updateUserRole);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
router.delete('/posts/:id', authenticate, authorize('admin'), deletePost);
router.get('/stats', authenticate, authorize('admin'), getSystemStats);
router.post('/backup', authenticate, authorize('admin'), triggerBackup);

module.exports = router;
