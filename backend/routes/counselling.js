const express = require('express');
const router = express.Router();
const Counselling = require('../models/Counselling');

// @route   POST api/counselling
// @desc    Add a new doctor for counselling
// @access  Public (or Admin Protected if auth is implemented)
router.post('/', async (req, res) => {
    try {
        const { name, specialization, experience, availableDays, availableTime, contactNumber, description, image } = req.body;

        // Basic Validation
        if (!name || !specialization || !experience || !availableDays || !availableTime || !contactNumber) {
            return res.status(400).json({ msg: 'Please enter all required fields' });
        }

        const newDoctor = new Counselling({
            name,
            specialization,
            experience,
            availableDays,
            availableTime,
            contactNumber,
            description,
            image
        });

        const savedDoctor = await newDoctor.save();
        res.json(savedDoctor);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/counselling
// @desc    Get all doctors
// @access  Public
router.get('/', async (req, res) => {
    try {
        const doctors = await Counselling.find().sort({ createdAt: -1 });
        res.json(doctors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/counselling/:id
// @desc    Update a doctor
// @access  Public (or Admin Protected if auth is implemented)
router.put('/:id', async (req, res) => {
    try {
        const { name, specialization, experience, availableDays, availableTime, contactNumber, description, image } = req.body;

        const doctorFields = {};
        if (name) doctorFields.name = name;
        if (specialization) doctorFields.specialization = specialization;
        if (experience) doctorFields.experience = experience;
        if (availableDays) doctorFields.availableDays = availableDays;
        if (availableTime) doctorFields.availableTime = availableTime;
        if (contactNumber) doctorFields.contactNumber = contactNumber;
        if (description) doctorFields.description = description;
        if (image) doctorFields.image = image;

        let doctor = await Counselling.findById(req.params.id);

        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        doctor = await Counselling.findByIdAndUpdate(
            req.params.id,
            { $set: doctorFields },
            { new: true }
        );

        res.json(doctor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/counselling/:id
// @desc    Delete a doctor
// @access  Public (or Admin Protected if auth is implemented)
router.delete('/:id', async (req, res) => {
    try {
        const doctor = await Counselling.findById(req.params.id);

        if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

        await Counselling.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Doctor removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
