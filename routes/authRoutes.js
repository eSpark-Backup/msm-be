const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
