const mongoose = require('mongoose');

const CounsellingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    specialization: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: String, // e.g., "5 years"
        required: true,
        trim: true
    },
    availableDays: {
        type: [String], // e.g., ["Monday", "Wednesday"]
        required: true
    },
    availableTime: {
        type: String, // e.g., "10:00 AM - 2:00 PM"
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String // URL or Base64
    }
}, { timestamps: true });

module.exports = mongoose.model('Counselling', CounsellingSchema);
