const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');

router.use(verifyToken);

router.get('/', requireRoles('SYSTEM_ADMIN', 'OPERATIONS_MANAGER', 'DEPARTMENT_HEAD'), auditController.getAuditLogs);

module.exports = router;
