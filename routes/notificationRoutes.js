const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const verifyToken = require('../middleware/verifyToken');

router.get('/' , verifyToken , notificationController.getNotifications);
router.put('/read-all' , verifyToken , notificationController.readAllNotifications);

module.exports = router;