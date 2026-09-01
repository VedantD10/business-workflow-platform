const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', departmentController.getDepartments);
router.get('/request-types', departmentController.getRequestTypes);

module.exports = router;
