const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: null
  },
  description: {
    type: String,
    required: false,
    trim: true,
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true
});

// Add index for better query performance
groupSchema.index({ name: 1, user_id: 1 });

module.exports = mongoose.model('Group', groupSchema);
