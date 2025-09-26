const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    device_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    },
    mqtt_user: {
      type: String,
      trim: true,
    },
    device_status : {
        type: Boolean,
        default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

deviceSchema.index({ user_id: 1, device_id: 1 }, { unique: true });


deviceSchema.virtual("device_data", {
  ref: "Device",
  localField: "device_id",
  foreignField: "_id",
  justOne: true
});

deviceSchema.virtual("groups_data", {
    ref: "Group",
    localField: "group_id",
    foreignField: "_id",
    justOne: true
})

module.exports = mongoose.model("AddDevice", deviceSchema);
