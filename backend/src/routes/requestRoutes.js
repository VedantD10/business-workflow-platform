const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { verifyToken } = require('../middleware/auth');
const { requireRequestAccess } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createRequestSchema, workflowActionSchema } = require('../utils/validators');

router.use(verifyToken);

router.post('/', validate(createRequestSchema), requestController.createRequest);
router.get('/', requestController.getRequests);
router.get('/:id', requireRequestAccess(), requestController.getRequestById);
router.post('/:id/action', requireRequestAccess(), validate(workflowActionSchema), requestController.handleWorkflowAction);

module.exports = router;
