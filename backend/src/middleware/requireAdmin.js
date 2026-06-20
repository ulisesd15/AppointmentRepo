const authenticateToken = require('./authenticateToken');

module.exports = function requireAdmin(req, res, next) {
  return authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    return next();
  });
};
