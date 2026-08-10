const About = require('../models/About');
const fleetConnect = require('../fleetConnect');

const getAbout = async (req, res) => {
    try {
        const device_uuid = req.params.device_uuid;
        const about = await About.findOne({ device_uuid });

        if (!about) {
            return res.status(404).json({
                success: false,
                message: 'About not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'About fetched successfully',
            data: about
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching about',
            error: error.message
        });
    }
};

const updateAbout = async (req , res) => {
    try{
        const device_uuid = req.params.device_uuid;
        const about = await About.findOne({ device_uuid });

        if (!about) {
            return res.status(404).json({
                success: false,
                message: 'About not found'
            });
        }
          
        const updatedAbout = await About.findOneAndUpdate({ device_uuid }, req.body, { new: true });

        fleetConnect.sendAboutConfig(device_uuid , req.body);

        res.status(200).json({
            success: true,
            message: 'About updated successfully',
            data: updatedAbout
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error updating about',
            error: error.message
        });
    }
}

module.exports = {
    getAbout,
    updateAbout
};