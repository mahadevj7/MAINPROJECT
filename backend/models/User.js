const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
        required: false
    },
    bloodGroup: {
        type: String,
        required: false,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: false,
        trim: true
    },
    homeAddress: {
        type: String,
        required: false,
        trim: true
    },
    emergencyContacts: [{
        name: { type: String, required: true },
        email: { type: String, required: false },
        phoneNumber: { type: String, required: true },
        relation: { type: String, required: true }
    }],
    ipAddresses: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length <= 3;
            },
            message: 'You can only have up to 3 authorized IP addresses.'
        }
    },
    profilePhoto: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
