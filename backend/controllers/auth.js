const db = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, pwd, role } = req.body;
  try {
    const hash = await bcrypt.hash(pwd, 10);
    const { rows } = await db.query(
      'INSERT INTO users (name, email, pwd, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hash, role || 'user']
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.login = async (req, res) => {
  const { email, pwd } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows[0]) return res.status(400).json({ msg: 'User not found' });
    const match = await bcrypt.compare(pwd, rows[0].pwd);
    if (!match) return res.status(400).json({ msg: 'Wrong pwd' });
    const token = jwt.sign({ id: rows[0].id, role: rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
