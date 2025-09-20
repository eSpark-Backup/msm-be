const Protocol = require('../models/Protocol');
const Device = require('../models/Device');

const getAllProtocols = async (req, res) => {
  try {
    const { device_uuid } = req.params;

    const protocols = await Protocol.find({ ofp_uid: device_uuid });
    
    res.json({
      success: true,
      message: 'Protocols fetched successfully',
      data: protocols
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
        success: false,
        message: err,
        error: 'Internal server error' 
    });
  }
};

module.exports = {
  getAllProtocols
};
