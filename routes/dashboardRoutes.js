const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', (req, res) => {
    dashboardController.getDashboard(req, res);
});

router.get('/:id', (req, res) => {
    dashboardController.getDashboardById(req, res);
});

router.post('/', (req, res) => {
    dashboardController.createDashboard(req, res);
});

router.put('/:id', (req, res) => {
    dashboardController.updateDashboard(req, res);
});

router.delete('/:id', (req, res) => {
    dashboardController.deleteDashboard(req, res);
});

module.exports = router;