const db = require('../database/db');
const { successResponse } = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

async function getUsers(req, res, next) {
  try {
    const { role, department_id } = req.query;
    let users = db.find('users');

    if (role) {
      users = users.filter(u => u.role === role);
    }
    if (department_id) {
      users = users.filter(u => u.department_id === Number(department_id));
    }

    const formatted = users.map(user => {
      const dept = user.department_id ? db.findById('departments', user.department_id) : null;
      const mgr = user.manager_id ? db.findById('users', user.manager_id) : null;
      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department_id: user.department_id,
        department_name: dept ? dept.name : null,
        manager_id: user.manager_id,
        manager_name: mgr ? mgr.full_name : null,
        created_at: user.created_at
      };
    });

    return successResponse(res, formatted);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = db.findById('users', req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const dept = user.department_id ? db.findById('departments', user.department_id) : null;
    const mgr = user.manager_id ? db.findById('users', user.manager_id) : null;

    return successResponse(res, {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: dept,
      manager: mgr ? { id: mgr.id, full_name: mgr.full_name, email: mgr.email } : null,
      created_at: user.created_at
    });
  } catch (err) {
    next(err);
  }
}

async function getRoles(req, res, next) {
  try {
    const roles = db.find('roles');
    return successResponse(res, roles);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers,
  getUserById,
  getRoles
};
