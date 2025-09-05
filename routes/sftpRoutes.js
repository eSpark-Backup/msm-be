const express = require('express');
const router = express.Router();
const sftpController = require('../controllers/sftpController');

router.get('/', (req, res) => {
    sftpController.getAllSftp(req, res);
});

router.get('/:id', (req, res) => {
    sftpController.getSingleSftp(req, res);
});

router.post('/', (req, res) => {
    sftpController.createSftp(req, res);
});

router.delete('/:id', (req, res) => {
    sftpController.deleteSftp(req, res);
});

router.put('/:id', (req, res) => {
    sftpController.updateSftp(req, res);
});

module.exports = router;
