const Measurements = require('../models/Measurements');

const getMeasurement = async (req, res) => {
    try {
        const measurement = await Measurements.findOne();

        if (!measurement) {
            return res.status(404).json({
                success: false,
                message: 'Measurement not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Measurement fetched successfully',
            data: measurement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching measurement',
            error: error.message
        });
    }
};

module.exports = {
    getMeasurement
};
