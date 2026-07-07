const { getUserByEmail } = require('../db');

function authMiddleware(req, res, next) {
  const email = req.header('x-user-email');
  if (!email) {
    return res.status(401).json({ message: 'Missing x-user-email header' });
  }
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Unknown user' });
  }
  req.user = user;
  next();
}

function ensureRole(expected) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.user.role !== expected) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = authMiddleware;
module.exports.ensureRole = ensureRole;
module.exports.requireHr = ensureRole('hr');
module.exports.requireEmployee = ensureRole('employee');
