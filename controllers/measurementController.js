const Measurements = require('../models/Measurements');
const fleetConnect = require('../fleetConnect');

const getMeasurement = async (req, res) => {
    try {
        const device_uuid = req.params.device_uuid;
        const command = req.params.command;

        // Use lean() to get plain JS object without Mongoose metadata
        const measurement = await Measurements.findOne({ device_uuid, command }).lean();
        
        if (!measurement) {
            return res.status(404).json({
                success: false,
                message: 'Measurement not found'
            });
        }

        // Sort measurements by channel number
        const sortedMeasurements = Object.fromEntries(
            Object.entries(measurement.measurements)
                .sort(([keyA], [keyB]) => {
                    const numA = parseInt(keyA.split('-')[1]);
                    const numB = parseInt(keyB.split('-')[1]);
                    return numA - numB;
                })
        );

        // Replace the measurements with sorted object
        measurement.measurements = sortedMeasurements;

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


const updateMeasurement = async(req , res) => {
    try{
        const device_uuid = req.params.device_uuid;
        const command = req.params.command;

        const measurement = await Measurements.findOne({device_uuid , command});
        
        if (!measurement) {
            return res.status(404).json({
                success: false,
                message: 'Measurement not found'
            });
        }

        measurement.measurements = req.body;
        await measurement.save();

        fleetConnect.sendMeasurementConfig(device_uuid , measurement);

        res.status(200).json({
            success: true,
            message: 'Measurement updated successfully',
            data: measurement
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error updating measurement',
            error: error.message
        });
    }
}

module.exports = {
    getMeasurement,
    updateMeasurement
};
