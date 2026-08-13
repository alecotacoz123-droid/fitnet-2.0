const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const dec = jwt.verify(token, process.env.JWT_SECRET);
    req.user = dec;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

const roleCheck = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ msg: 'Forbidden' });
  next();
};

module.exports = { authenticate: auth, authorize: roleCheck };
