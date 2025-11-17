const express = require('express');
const router = express.Router();
const fleetConnect = require('../fleetConnect');

router.get('/', (req, res) => {
    fleetConnect.publishMessage('msm/ESP90000005/sub/ntp', { data: ['pool.ntp.org'] });
    res.send('Hello World!');
});


module.exports = router;