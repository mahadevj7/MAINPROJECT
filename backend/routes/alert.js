const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const User = require('../models/User');

// @route   POST api/alerts
// @desc    Create a new SOS alert
// @access  Public (or Private if you send token, but SOS might be urgent)
router.post('/', async (req, res) => {
    try {
        const { userId, ipAddress, location } = req.body;

        console.log('Received Alert Request:', { userId, ipAddress });

        if (!ipAddress) {
            return res.status(400).json({ message: 'IP Address is required' });
        }

        let ipMatched = false;
        let userStub = null;

        if (userId && userId !== 'null') {
            try {
                const user = await User.findById(userId);
                if (user) {
                    userStub = userId;
                    // Automatic Verification Logic
                    if (user.ipAddresses && user.ipAddresses.length > 0) {
                        ipMatched = user.ipAddresses.includes(ipAddress);
                    }
                    console.log(`IP Verification Result for User ${user.name}: ${ipMatched ? 'MATCH' : 'NO MATCH'}`);
                }
            } catch (err) {
                console.warn("Invalid User ID provided:", userId);
            }
        } else {
            console.log('Received Anonymous SOS Alert');
        }

        // Construct alert data
        const alertData = {
            ipAddress,
            location,
            ipMatched,
            status: 'Active'
        };

        // Only attach user if we have a valid user ID (otherwise leave it undefined/null)
        if (userStub) {
            alertData.user = userStub;
        }

        const newAlert = new Alert(alertData);

        const savedAlert = await newAlert.save();
        console.log('Alert saved to database:', savedAlert._id);

        // Populate user details if user exists
        if (userStub) {
            try {
                await savedAlert.populate('user', 'name email phoneNumber emergencyContacts');
            } catch (populateErr) {
                console.error("Error populating user:", populateErr);
            }
        }

        res.status(201).json({
            success: true,
            alert: savedAlert,
            message: 'SOS Alert Sent Successfully'
        });

    } catch (err) {
        console.error('Error creating alert:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   GET api/alerts
// @desc    Get all alerts (for Admin Dashboard)
// @access  Public (Should be protected in prod)
router.get('/', async (req, res) => {
    try {
        const alerts = await Alert.find()
            .populate('user', 'name email phoneNumber homeAddress bloodGroup')
            .sort({ createdAt: -1 });
        res.json(alerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET api/alerts/user/:userId
// @desc    Get alerts for a specific user
// @access  Public (Should be protected in prod)
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const alerts = await Alert.find({ user: userId })
            .sort({ createdAt: -1 }); // Newest first
        res.json(alerts);
    } catch (err) {
        console.error("Error fetching user alerts:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT api/alerts/:id/status
// @desc    Update alert status (e.g., to Resolved)
// @access  Public (Should be protected)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        // Validate Status
        const validStatuses = ['Active', 'Resolved', 'False Alarm'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid Status' });
        }

        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        res.json(alert);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
