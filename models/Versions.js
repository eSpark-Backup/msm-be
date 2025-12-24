const mongoose = require("mongoose");

const VersionSchema = new mongoose.Schema(
    {
        version: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);




module.exports = mongoose.model("Versions", VersionSchema);
