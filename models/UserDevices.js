const mongoose = require("mongoose");

const userDeviceSchema = new mongoose.Schema(
  {
    device_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userDeviceSchema.index({ user_id: 1, device_id: 1 }, { unique: true });


userDeviceSchema.virtual("device_data", {
  ref: "Device",
  localField: "device_id",
  foreignField: "_id",
  justOne: true
});

userDeviceSchema.virtual("user_data", {
  ref: "User",
  localField: "user_id",
  foreignField: "_id",
  justOne: true
});

module.exports = mongoose.model("UserDevices", userDeviceSchema);
