const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../database/db');
const { UnauthorizedError } = require('../utils/errors');

function verifyToken(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing. Please log in.');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = db.findById('users', decoded.id);

    if (!user) {
      throw new UnauthorizedError('User account associated with token no longer exists.');
    }

    // Attach sanitized user to req
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department_id: user.department_id,
      manager_id: user.manager_id
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Session expired. Please log in again.'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid authentication token signature.'));
    }
    next(err);
  }
}

module.exports = {
  verifyToken
};
