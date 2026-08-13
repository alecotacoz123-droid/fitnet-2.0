const express = require('express');
const router = express.Router();
const { 
  createPost, 
  getFeed, 
  toggleLike, 
  addComment, 
  searchContent,
  updatePost,
  deletePost
} = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');
const upload = require('../utils/uploader');

router.post('/', authenticate, upload.single('media'), createPost);
router.get('/', authenticate, getFeed);
router.get('/search', authenticate, searchContent);
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/comment', authenticate, addComment);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

module.exports = router;
