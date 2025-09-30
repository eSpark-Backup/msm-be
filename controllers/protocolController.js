const Telemetry = require('../models/Telemetry')

const getAllProtocols = async (req, res) => {
  try {
    const { device_uuid } = req.params;

    const telemetry = await Telemetry.aggregate([
      { $match: { device_uuid } },

      {
        $group: {
          _id: { channel_id: "$channel_id", phase: "$phase" },
          latest: {
            $topN: {
              output: "$$ROOT",
              sortBy: { createdAt: -1 },
              n: 1
            }
          }
        }
      },

      { $unwind: "$latest" },
      { $replaceRoot: { newRoot: "$latest" } },
      {
        $lookup: {
          from: "devices",            
          localField: "device_uuid",     
          foreignField: "device_uuid",  
          as: "deviceInfo"
        }
      },

      { $sort: { channel_id: 1, phase: 1 } }
    ]).allowDiskUse(true);

    const protocols = await mapProtocols(telemetry);

    res.json({
      success: true,
      count: telemetry.length,
      message: 'Telemetry fetched successfully',
      protocols
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


const mapProtocols = async (telemetry) => {
  try {

    const channel_1 = telemetry.filter(item => item.channel_id === 1)
    const channel_2 = telemetry.filter(item => item.channel_id === 2)
    const channel_3 = telemetry.filter(item => item.channel_id === 3)
    const channel_4 = telemetry.filter(item => item.channel_id === 4)
    const channel_5 = telemetry.filter(item => item.channel_id === 5)
    const channel_6 = telemetry.filter(item => item.channel_id === 6)
    const channel_7 = telemetry.filter(item => item.channel_id === 7)
    const channel_8 = telemetry.filter(item => item.channel_id === 8)
    const channel_9 = telemetry.filter(item => item.channel_id === 9)
    const channel_10 = telemetry.filter(item => item.channel_id === 10)
    const channel_11 = telemetry.filter(item => item.channel_id === 11)
    const channel_12 = telemetry.filter(item => item.channel_id === 12)

    return {
      "timestamp": telemetry[0].timestamp,
      "ip_address": telemetry[0].deviceInfo[0].device_ip,
      "ofp_uid": telemetry[0].device_uuid,
      "data": {
        "V_R": channel_1[0].line_voltage,
        "In1_R1": channel_1[0].current,
        "In1_RPF": channel_1[0].power_factor,
        "V_Y": channel_1[1].line_voltage,
        "In1_Y1": channel_1[1].current,
        "In1_YPF": channel_1[1].power_factor,
        "V_B": channel_1[2].line_voltage,
        "In1_B1": channel_1[2].current,
        "In1_BPF": channel_1[2].power_factor,
        "P1_R": channel_1[0].active_power,
        "P1_Y": channel_1[1].active_power,
        "P1_B": channel_1[2].active_power,
        "P1": channel_1[0].active_power + channel_1[1].active_power + channel_1[2].active_power,
        "Q1_R": channel_1[0].reactive_power,
        "Q1_Y": channel_1[1].reactive_power,
        "Q1_B": channel_1[2].reactive_power,
        "Q1": channel_1[0].reactive_power + channel_1[1].reactive_power + channel_1[2].reactive_power,
        "S1_R": channel_1[0].apparent_power,
        "S1_Y": channel_1[1].apparent_power,
        "S1_B": channel_1[2].apparent_power,
        "S1": channel_1[0].apparent_power + channel_1[1].apparent_power + channel_1[2].apparent_power,
        "Epimp1": channel_1[0].active_energy_positive,
        "Epexp1": channel_1[0].active_energy_negative,
        "Eqimp1": channel_1[0].reactive_energy_positive,
        "Eqexp1": channel_1[0].reactive_energy_negative,
        "F1_R": channel_1[0].current,
        "PF_R1": channel_1[0].power_factor,
        "F1_Y": channel_1[1].current,
        "PF_Y1": channel_1[1].power_factor,
        "F1_B": channel_1[2].current,
        "PF_B1": channel_1[2].power_factor,
        "F1_P": channel_1[0].active_power + channel_1[1].active_power + channel_1[2].active_power,
        "F1_Q": channel_1[0].reactive_power + channel_1[1].reactive_power + channel_1[2].reactive_power,
        "F1_S": channel_1[0].apparent_power + channel_1[1].apparent_power + channel_1[2].apparent_power,
        "F1_Epimp": channel_1[0].active_energy_positive,
        "F1_Epexp": channel_1[0].active_energy_negative,
        "F1_Eqimp": channel_1[0].reactive_energy_positive,
        "F1_Eqexp": channel_1[0].reactive_energy_negative,
        "F2_R": channel_2[0].current,
        "PF_R2": channel_2[0].power_factor, 
        "F2_Y": channel_2[1].current,
        "PF_Y2": channel_2[1].power_factor,
        "F2_B": channel_2[2].current,
        "PF_B2": channel_2[2].power_factor,
        "F2_P": channel_2[0].active_power + channel_2[1].active_power + channel_2[2].active_power,
        "F2_Q": channel_2[0].reactive_power + channel_2[1].reactive_power + channel_2[2].reactive_power,
        "F2_S": channel_2[0].apparent_power + channel_2[1].apparent_power + channel_2[2].apparent_power,
        "F2_Epimp": channel_2[0].active_energy_positive,
        "F2_Epexp": channel_2[0].active_energy_negative,
        "F2_Eqimp": channel_2[0].reactive_energy_positive,
        "F2_Eqexp": channel_2[0].reactive_energy_negative,
        "F3_R": channel_3[0].current,
        "PF_R3": channel_3[0].power_factor,
        "F3_Y": channel_3[1].current,
        "PF_Y3": channel_3[1].power_factor,
        "F3_B": channel_3[2].current,
        "PF_B3": channel_3[2].power_factor,
        "F3_P": channel_3[0].active_power + channel_3[1].active_power + channel_3[2].active_power,
        "F3_Q": channel_3[0].reactive_power + channel_3[1].reactive_power + channel_3[2].reactive_power,
        "F3_S": channel_3[0].apparent_power + channel_3[1].apparent_power + channel_3[2].apparent_power,
        "F3_Epimp": channel_3[0].active_energy_positive,
        "F3_Epexp": channel_3[0].active_energy_negative,
        "F3_Eqimp": channel_3[0].reactive_energy_positive,
        "F3_Eqexp": channel_3[0].reactive_energy_negative,
        "F4_R": channel_4[0].current,
        "PF_R4": channel_4[0].power_factor,
        "F4_Y": channel_4[1].current,
        "PF_Y4": channel_4[1].power_factor,
        "F4_B": channel_4[2].current,
        "PF_B4": channel_4[2].power_factor,
        "F4_P": channel_4[0].active_power + channel_4[1].active_power + channel_4[2].active_power,
        "F4_Q": channel_4[0].reactive_power + channel_4[1].reactive_power + channel_4[2].reactive_power,
        "F4_S": channel_4[0].apparent_power + channel_4[1].apparent_power + channel_4[2].apparent_power,
        "F4_Epimp": channel_4[0].active_energy_positive,
        "F4_Epexp": channel_4[0].active_energy_negative,
        "F4_Eqimp": channel_4[0].reactive_energy_positive,
        "F4_Eqexp": channel_4[0].reactive_energy_negative,
        "F5_R": channel_5[0].current,
        "PF_R5": channel_5[0].power_factor,
        "F5_Y": channel_5[1].current,
        "PF_Y5": channel_5[1].power_factor,
        "F5_B": channel_5[2].current,
        "PF_B5": channel_5[2].power_factor,
        "F5_P": channel_5[0].active_power + channel_5[1].active_power + channel_5[2].active_power,
        "F5_Q": channel_5[0].reactive_power + channel_5[1].reactive_power + channel_5[2].reactive_power,
        "F5_S": channel_5[0].apparent_power + channel_5[1].apparent_power + channel_5[2].apparent_power,
        "F5_Epimp": channel_5[0].active_energy_positive,
        "F5_Epexp": channel_5[0].active_energy_negative,
        "F5_Eqimp": channel_5[0].reactive_energy_positive,
        "F5_Eqexp": channel_5[0].reactive_energy_negative,
        "F6_R": channel_6[0].current,
        "PF_R6": channel_6[0].power_factor,
        "F6_Y": channel_6[1].current,
        "PF_Y6": channel_6[1].power_factor,
        "F6_B": channel_6[2].current,
        "PF_B6": channel_6[2].power_factor,
        "F6_P": channel_6[0].active_power + channel_6[1].active_power + channel_6[2].active_power,
        "F6_Q": channel_6[0].reactive_power + channel_6[1].reactive_power + channel_6[2].reactive_power,
        "F6_S": channel_6[0].apparent_power + channel_6[1].apparent_power + channel_6[2].apparent_power,
        "F6_Epimp": channel_6[0].active_energy_positive,
        "F6_Epexp": channel_6[0].active_energy_negative,
        "F6_Eqimp": channel_6[0].reactive_energy_positive,
        "F6_Eqexp": channel_6[0].reactive_energy_negative,
        "F7_R": channel_7[0].current,
        "PF_R7": channel_7[0].power_factor,
        "F7_Y": channel_7[1].current,
        "PF_Y7": channel_7[1].power_factor,
        "F7_B": channel_7[2].current,
        "PF_B7": channel_7[2].power_factor,
        "F7_P": channel_7[0].active_power + channel_7[1].active_power + channel_7[2].active_power,
        "F7_Q": channel_7[0].reactive_power + channel_7[1].reactive_power + channel_7[2].reactive_power,
        "F7_S": channel_7[0].apparent_power + channel_7[1].apparent_power + channel_7[2].apparent_power,
        "F7_Epimp": channel_7[0].active_energy_positive,
        "F7_Epexp": channel_7[0].active_energy_negative,
        "F7_Eqimp": channel_7[0].reactive_energy_positive,
        "F7_Eqexp": channel_7[0].reactive_energy_negative,
        "F8_R": channel_8[0].current,
        "PF_R8": channel_8[0].power_factor,
        "F8_Y": channel_8[1].current,
        "PF_Y8": channel_8[1].power_factor,
        "F8_B": channel_8[2].current,
        "PF_B8": channel_8[2].power_factor,
        "F8_P": channel_8[0].active_power + channel_8[1].active_power + channel_8[2].active_power,
        "F8_Q": channel_8[0].reactive_power + channel_8[1].reactive_power + channel_8[2].reactive_power,
        "F8_S": channel_8[0].apparent_power + channel_8[1].apparent_power + channel_8[2].apparent_power,
        "F8_Epimp": channel_8[0].active_energy_positive,
        "F8_Epexp": channel_8[0].active_energy_negative,
        "F8_Eqimp": channel_8[0].reactive_energy_positive,
        "F8_Eqexp": channel_8[0].reactive_energy_negative
      }
    }

  } catch (error) {
    console.error(error);
    return;
  }
}

module.exports = {
  getAllProtocols
};
