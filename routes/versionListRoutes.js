const express = require('express');
const router = express.Router();
const versionListController = require('../controllers/versionListController');
const verifyToken = require('../middleware/verifyToken')
const multer = require('multer')

const storage = multer.memoryStorage()
const memUpload = multer({ storage: storage })

router.get('/', verifyToken, (req, res) => {
    versionListController.getVersionList(req, res);
});

router.put('/', verifyToken, (req, res) => {
    versionListController.updateVersionList(req, res);
});

router.get('/check-updates', verifyToken, (req, res) => {
    versionListController.checkUpdates(req, res);
});

router.get('/export'  , (req , res) => {
    versionListController.exportAllVersionList(req, res);
})

router.post('/export'  , (req , res) => {
    versionListController.exportSelectedVersionList(req, res);
})

router.post('/import' , verifyToken , memUpload.single('file') ,(req , res) => {
    versionListController.importVersionList(req, res);
})

router.delete('/:version', verifyToken, (req, res) => {
    versionListController.deleteVersion(req, res);
});

module.exports = router;