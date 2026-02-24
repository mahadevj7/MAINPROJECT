const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const auth = require('../middleware/auth'); // Assuming you have an auth middleware

// @route   POST api/location
// @desc    Save current location
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { latitude, longitude, address } = req.body;

        const newLocation = new Location({
            user: req.user.id,
            latitude,
            longitude,
            address
        });

        const location = await newLocation.save();
        res.json(location);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/location/history
// @desc    Get location history for current user
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        // Get last 24 hours history, or just the last 50 entries
        const history = await Location.find({ user: req.user.id })
            .sort({ createdAt: -1 }) // Newest first
            .limit(50);

        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
