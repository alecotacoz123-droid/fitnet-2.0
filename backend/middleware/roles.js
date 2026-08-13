const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere uno de los siguientes roles: [${allowedRoles.join(', ')}]. Tu rol actual es: '${req.user.role}'` 
      });
    }

    next();
  };
};

module.exports = { authorize };
