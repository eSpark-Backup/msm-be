const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      trim: true,
    },
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
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
      unique: true,
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
    },
    mqtt_username: {
      type: String,
      trim: true,
    },
    mqtt_password: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AddDevice", deviceSchema);
