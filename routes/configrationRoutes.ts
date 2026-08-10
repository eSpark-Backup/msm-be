const router = require('express').Router();
const configrationController = require('../controllers/configrationController');
const verifyToken = require('../middleware/verifyToken');


router.get('/:device_uuid' , verifyToken , configrationController.getConfig);
router.put('/:device_uuid' , verifyToken , configrationController.updateConfig);

module.exports = router
