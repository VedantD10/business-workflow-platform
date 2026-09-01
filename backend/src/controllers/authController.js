const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const db = require('../database/db');
const { successResponse } = require('../utils/response');
const { UnauthorizedError, ConflictError, BadRequestError } = require('../utils/errors');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      department_id: user.department_id
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

function formatUserResponse(user) {
  const department = user.department_id ? db.findById('departments', user.department_id) : null;
  const manager = user.manager_id ? db.findById('users', user.manager_id) : null;

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    department: department ? { id: department.id, code: department.code, name: department.name } : null,
    manager: manager ? { id: manager.id, full_name: manager.full_name, email: manager.email } : null,
    created_at: user.created_at
  };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new UnauthorizedError('Invalid email address or password.');
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email address or password.');
    }

    const token = generateToken(user);
    const userFormatted = formatUserResponse(user);

    return successResponse(res, { token, user: userFormatted }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { email, password, full_name, role, department_id, manager_id } = req.body;

    const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new ConflictError(`An account with email '${email}' already exists.`);
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = db.insert('users', {
      email,
      password_hash: passwordHash,
      full_name,
      role: role || 'EMPLOYEE',
      department_id: Number(department_id),
      manager_id: manager_id ? Number(manager_id) : null
    });

    const token = generateToken(newUser);
    const userFormatted = formatUserResponse(newUser);

    return successResponse(res, { token, user: userFormatted }, 'Account registered successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = db.findById('users', req.user.id);
    if (!user) {
      throw new UnauthorizedError('User profile not found.');
    }
    return successResponse(res, { user: formatUserResponse(user) });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  register,
  getCurrentUser,
  logout
};
