const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));  // Increased for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// DB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // No deprecated options needed for Mongoose 6+
        console.log('MongoDB Connected to MainProjectDB');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // process.exit(1); // Keep running to allow retry or debugging
    }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/community', require('./routes/community'));
app.use('/api/alerts', require('./routes/alert'));
app.use('/api/location', require('./routes/location'));
app.use('/api/counselling', require('./routes/counselling'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/feedback', require('./routes/feedback'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
