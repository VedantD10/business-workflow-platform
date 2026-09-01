const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', userController.getUsers);
router.get('/roles', userController.getRoles);
router.get('/:id', userController.getUserById);

module.exports = router;
