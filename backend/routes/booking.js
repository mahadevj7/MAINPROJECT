const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { doctorId, date, time, notes } = req.body;

        const newBooking = new Booking({
            user: req.user.id,
            doctor: doctorId,
            date,
            time,
            notes
        });

        const savedBooking = await newBooking.save();
        res.json(savedBooking);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bookings/user
// @desc    Get all bookings for the current user
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('doctor', ['name', 'specialization', 'image'])
            .sort({ date: 1 }); // Sort by date ascending
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bookings/doctor/:id
// @desc    Get all bookings for a specific doctor
// @access  Public (or Admin protected)
router.get('/doctor/:id', async (req, res) => {
    try {
        const bookings = await Booking.find({ doctor: req.params.id })
            .populate('user', ['name', 'email'])
            .sort({ date: 1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/bookings/:id
// @desc    Update a booking status
// @access  Public (or Admin protected)
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;

        let booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        ).populate('user', ['name', 'email']);

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
