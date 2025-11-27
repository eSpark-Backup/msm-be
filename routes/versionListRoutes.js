const express = require('express');
const router = express.Router();
const versionListController = require('../controllers/versionListController');
const verifyToken = require('../middleware/verifyToken')

router.get('/', verifyToken, (req, res) => {
    versionListController.getVersionList(req, res);
});

router.put('/', verifyToken, (req, res) => {
    versionListController.updateVersionList(req, res);
});

module.exports = router;