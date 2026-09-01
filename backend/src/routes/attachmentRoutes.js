const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyToken);

router.post('/upload/request/:requestId', upload.single('file'), attachmentController.uploadAttachment);
router.get('/download/:id', attachmentController.downloadAttachment);

module.exports = router;
