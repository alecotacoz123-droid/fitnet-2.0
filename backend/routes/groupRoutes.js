const express = require('express');
const router = express.Router();
const { 
  createGroup, 
  getGroups,
  getGroupDetail,
  requestJoinGroup, 
  manageMember, 
  getPendingRequests,
  getMyGroups,
  leaveGroup,
  removeMember,
  deleteGroup
} = require('../controllers/groupController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createGroup);
router.get('/', authenticate, getGroups);
router.get('/my-groups', authenticate, getMyGroups);
router.get('/pending', authenticate, getPendingRequests);
router.get('/:id/detail', authenticate, getGroupDetail);
router.post('/:id/join', authenticate, requestJoinGroup);
router.put('/:group_id/members/:user_id', authenticate, manageMember);
router.delete('/:id/leave', authenticate, leaveGroup);
router.delete('/:group_id/members/:user_id', authenticate, removeMember);
router.delete('/:id', authenticate, deleteGroup);

module.exports = router;
