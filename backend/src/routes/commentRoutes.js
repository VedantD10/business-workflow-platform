const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/auth');
const { requireRequestAccess } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createCommentSchema } = require('../utils/validators');

router.use(verifyToken);

router.get('/request/:requestId', requireRequestAccess(), commentController.getComments);
router.post('/request/:requestId', requireRequestAccess(), validate(createCommentSchema), commentController.addComment);

module.exports = router;
