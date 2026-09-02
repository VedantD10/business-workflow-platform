const { ForbiddenError } = require('../utils/errors');
const db = require('../database/db');

/**
 * Ensures user has one of the allowed roles.
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('User context missing for RBAC check.'));
    }

    if (allowedRoles.includes(req.user.role) || req.user.role === 'SYSTEM_ADMIN') {
      return next();
    }

    return next(
      new ForbiddenError(
        `Access denied. Role '${req.user.role}' is not authorized for this resource. Required roles: [${allowedRoles.join(', ')}]`
      )
    );
  };
}

/**
 * Ensures user is either the creator of the request OR has an authorized role (Manager, Admin, etc.)
 */
function requireRequestAccess() {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('User context missing.'));
    }

    // Admins and Operations Managers have broad access
    if (['SYSTEM_ADMIN', 'OPERATIONS_MANAGER'].includes(req.user.role)) {
      return next();
    }

    const requestId = req.params.id || req.params.requestId || req.body.request_id || req.query.request_id;
    if (!requestId) return next();

    const request = db.findById('requests', requestId);
    if (!request) return next(); // Handled by controller 404

    // Creator has access
    if (request.user_id === req.user.id) {
      return next();
    }

    // Department staff/manager of request department, target handling department, or reporting manager of creator
    const creator = db.findById('users', request.user_id);
    if (creator && creator.manager_id === req.user.id) {
      return next();
    }

    const reqType = db.findOne('request_types', rt => rt.code === request.request_type_code);
    const isTargetDeptStaff = reqType && reqType.department_id === req.user.department_id;

    if (['REPORTING_MANAGER', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF'].includes(req.user.role)) {
      if (req.user.department_id === request.department_id || isTargetDeptStaff) {
        return next();
      }
    }

    return next(new ForbiddenError('Access Denied: You do not have permission to view or manage this request document.'));
  };
}

module.exports = {
  requireRoles,
  requireRequestAccess
};
