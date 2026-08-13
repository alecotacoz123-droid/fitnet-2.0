const db = require('../models/db');
const axios = require('axios');

exports.createPost = async (req, res) => {
  const { content, media_url } = req.body;
  let tags = '';
  // Call AI Mock if video
  if (media_url && media_url.includes('video')) {
    try {
      const aiRes = await axios.post('http://localhost:5000/classify', { url: media_url });
      tags = aiRes.data.tags.join(',');
    } catch(e) { console.log('AI err', e.message); }
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO posts (user_id, content, media_url, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, content, media_url, tags]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getFeed = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT p.*, u.name FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
