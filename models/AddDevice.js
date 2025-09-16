const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      trim: true,
    },
    groups: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    },
    device_profile: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: String,
    },
    access_token: {
      type: String,
      required: true,
    },
    z509: {
      type: String,
      trim: true,
    },
    mqtt_client_id: {
      type: String,
      trim: true,
    },
    mqtt_user: {
      type: String,
      trim: true,
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

deviceSchema.index({ user_id: 1, name: 1 }, { unique: true });


deviceSchema.virtual("device_data", {
  ref: "Device",
  localField: "name",
  foreignField: "device_uuid",
  justOne: true
});

deviceSchema.virtual("groups_data", {
    ref: "Group",
    localField: "groups",
    foreignField: "_id",
    justOne: true
})

module.exports = mongoose.model("AddDevice", deviceSchema);
