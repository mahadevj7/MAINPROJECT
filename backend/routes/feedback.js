const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// @route   POST api/feedback
// @desc    Submit a new feedback
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { rating, subject, message } = req.body;

        if (!rating || !subject || !message) {
            return res.status(400).json({ message: 'Rating, subject, and message are required' });
        }

        const newFeedback = new Feedback({
            user: req.user.id,
            rating,
            subject,
            message
        });

        const savedFeedback = await newFeedback.save();
        res.json(savedFeedback);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/feedback/user
// @desc    Get all feedbacks submitted by the current user
// @access  Private
router.get('/user', auth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/feedback
// @desc    Get all feedbacks (admin)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', ['name', 'email'])
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/feedback/:id
// @desc    Delete a feedback
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
