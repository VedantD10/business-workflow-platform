const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../database/db');

function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required: Missing WebSocket JWT token'));
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = db.findById('users', decoded.id);

    if (!user) {
      return next(new Error('Authentication required: User no longer exists'));
    }

    // Attach authenticated user context to socket
    socket.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department_id: user.department_id
    };

    next();
  } catch (err) {
    next(new Error('Authentication failed: Invalid or expired token'));
  }
}

module.exports = {
  authenticateSocket
};
