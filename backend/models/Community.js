const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    imageUrl: {
        type: String,
        required: false,
        trim: true
    },
    imageBase64: {
        type: String,
        required: false
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        userName: String
    }],
    comments: [commentSchema],
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for faster queries
postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1 });

module.exports = mongoose.model('Community', postSchema);
