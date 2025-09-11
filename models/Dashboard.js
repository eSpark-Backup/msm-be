const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: String, 
      required: true,
    },
    device_id: {
      type: String,
      required: false,
      trim: true,
    },
    groups: [
      {
        type : 'String'
      },
    ],
    mobile_application_setting: {
      type: Boolean,
      default: false,
    },
    dashboard_order_in_mobile_application: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dashboard", DashboardSchema);
