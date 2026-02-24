const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    type: {
        type: String,
        enum: ['SOS'],
        default: 'SOS'
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    ipAddress: {
        type: String,
        required: true
    },
    ipMatched: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Active', 'Resolved', 'False Alarm'],
        default: 'Active'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
