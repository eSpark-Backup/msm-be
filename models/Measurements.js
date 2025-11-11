const mongoose = require('mongoose');

const measurementsSchema = new mongoose.Schema({
    command: {
        type: String,
        required: true
    },
    ct_ratio:{
        type: Object,
        required: true
    },
    v_offset:{
        type: Object,
        required: true
    },
    i_offset: {
        type: Object,
        required: true
    },
    
})

module.exports = mongoose.model('Measurements', measurementsSchema);
