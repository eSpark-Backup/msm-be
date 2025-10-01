const Telemetry = require('../models/Telemetry');
const moment = require('moment-timezone');
const { mapProtocols } = require('../utils/mapProtocol');

const getAllProtocols = async (req, res) => {
  try {
    const { device_uuid } = req.params;
    const { limit, timezone = 'Asia/Karachi', range_value = 2, range_unit = 'hours' , startTime : startQuery , endTime : endQuery } = req.query;

    let startTime, endTime;

    if (!startQuery || !endQuery) {
      endTime = moment.tz(timezone); 
      startTime = endTime.clone().subtract(Number(range_value), range_unit); 
    }else{
      startTime = moment.tz(startQuery, timezone);
      endTime = moment.tz(endQuery, timezone);
    }

    const startUTC = startTime.utc().toDate();
    const endUTC = endTime.utc().toDate();

    const telemetry = await Telemetry.aggregate([
      {
        $match: {
          device_uuid,
          createdAt: { $gte: startUTC, $lte: endUTC } 
        }
      },
      {
        $group: {
          _id: { channel_id: "$channel_id", phase: "$phase" },
          latest: {
            $topN: {
              output: "$$ROOT",
              sortBy: { createdAt: -1 },
              n: parseInt(limit) || 10
            }
          }
        }
      },

      { $unwind: "$latest" },
      { $replaceRoot: { newRoot: "$latest" } },
      {
        $setWindowFields: {
          partitionBy: { channel_id: "$channel_id", phase: "$phase" },
          sortBy: { createdAt: -1 },
          output: { rank: { $rank: {} } }
        }
      },

      {
        $lookup: {
          from: "devices",
          localField: "device_uuid",
          foreignField: "device_uuid",
          as: "deviceInfo"
        }
      },

      { $sort: { channel_id: 1, phase: 1, createdAt: -1 } }
    ]).allowDiskUse(true);

    const telemetryByRank = filterTelemetryByRank(telemetry);

    const protocolsByRank = {};
    for (const rank in telemetryByRank) {
      protocolsByRank[rank] = await mapProtocols(telemetryByRank[rank]);
    }

    res.json({
      success: true,
      count: telemetry.length,
      message: 'Telemetry fetched successfully',
      protocolsByRank
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


const filterTelemetryByRank = (telemetry) => {
  const result = {};

  telemetry.forEach(item => {
    const r = item.rank; 
    if (!result[r]) {
      result[r] = [];
    }
    result[r].push(item);
  });

  return result;
};


module.exports = {
  getAllProtocols
};
