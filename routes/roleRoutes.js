const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authrize = require('../middleware/authrize');
const verifyToken = require('../middleware/verifyToken')

router.post('/', roleController.createRole);
router.get('/', verifyToken, authrize(['admin']), roleController.getRoles);
router.get('/:id', roleController.getRoleById);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;
