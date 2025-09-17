const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const verifyToken = require('../middleware/verifyToken');
const authrize = require('../middleware/authrize');

router.get('/', deviceController.getAllDevices);

router.post("/user", verifyToken, deviceController.createDevice);

router.put("/user", verifyToken, deviceController.updateDevice);

router.delete("/user/:device_uuid", verifyToken, deviceController.deleteDevice);

router.put("/user/:device_uuid", verifyToken, deviceController.updateDevice);

router.get("/user", verifyToken, deviceController.getAllUserDevices);

router.get("/user/:device_uuid", verifyToken, deviceController.getSingleUserDevice);

router.get("/user/id/:id" , verifyToken , authrize(['super_admin' , 'admin']) , deviceController.getSingleUserDeviceById)

router.post('/:deviceId/reboot', deviceController.rebootDevice);

router.get('/:deviceId', deviceController.getDeviceById);


module.exports = router;
