const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authrize = require('../middleware/authrize');
const verifyToken = require('../middleware/verifyToken')
const handleUserUpload = require('../middleware/hanldeUserUpload');

router.get('/', verifyToken, authrize(['super_admin']), (req, res) => {
    userController.getAllUsers(req, res);
});

router.get('/me', verifyToken , (req, res) => {
    userController.getMe(req, res);
});

router.post('/', verifyToken, authrize(['super_admin']), (req, res) => {
    userController.createUser(req, res);
});


router.put('/:id', verifyToken, authrize(['super_admin']), handleUserUpload.fields([{name: 'logo'},{name : 'profile_image'}]), (req, res) => {
    userController.updateUser(req, res);
});

router.put('/me', verifyToken, handleUserUpload.fields([{name: 'logo'},{name : 'profile_image'}]), (req, res) => {
    userController.updateMe(req, res);
});

router.delete('/:id', verifyToken, authrize(['super_admin']), (req, res) => {
    userController.deleteUser(req, res);
});

router.get('/:id', verifyToken, authrize(['super_admin']), (req, res) => {
    userController.getUserById(req, res);
});


module.exports = router;
