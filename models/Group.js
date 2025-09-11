const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  customer_name: {
    type: String,
    required: true,
    trim: true
  },
  all_user: {
    type: Boolean,
    default: false
  },
  share_entity_group: {
    type: Boolean,
    default : false
  },
  permissions: {
    type: String,
    enum: ['read', 'write', 'others'],
    required: true,
    default: 'read'
  }
}, {
  timestamps: true
});

// Add index for better query performance
groupSchema.index({ name: 1, customer_name: 1 });

module.exports = mongoose.model('Group', groupSchema);
