const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const aboutController = require('../controllers/aboutController');

router.get('/:device_uuid', verifyToken , aboutController.getAbout);
router.put('/:device_uuid', verifyToken , aboutController.updateAbout);

module.exports = router;
