const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authrize = require('../middleware/authrize');
const verifyToken = require('../middleware/verifyToken')

router.post('/', verifyToken, authrize(['super_admin']), roleController.createRole);
router.get('/', verifyToken, authrize(['super_admin']), roleController.getRoles);
router.get('/:id', verifyToken, authrize(['super_admin']), roleController.getRoleById);
router.put('/:id', verifyToken, authrize(['super_admin']), roleController.updateRole);
router.delete('/:id', verifyToken, authrize(['super_admin']), roleController.deleteRole);

module.exports = router;
