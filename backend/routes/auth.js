const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Validation middleware (basic)
const validateSignup = (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }
    next();
};

// Auth Middleware
const auth = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Signup Route
router.post('/signup', validateSignup, async (req, res) => {
    try {
        const { name, email, password, role, gender, bloodGroup, phoneNumber, emergencyContacts } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Initial IP address
        const ip = req.ip || req.connection.remoteAddress;

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            gender,
            bloodGroup,
            phoneNumber,
            emergencyContacts: emergencyContacts || [],
            ipAddresses: [ip]
        });

        await user.save();
        console.log('New user created with role:', user.role);

        // Create Token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login Route
router.post('/login', validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // IP Check/Add
        const ip = req.ip || req.connection.remoteAddress;
        // Simple check if IP exists
        if (!user.ipAddresses.includes(ip)) {
            if (user.ipAddresses.length >= 3) {
                // Optional: Could block login or just warn. Requirement says "IP address (upto 3 devices)". 
                // Usually this means we track up to 3. If a 4th comes, what happens? 
                // For now, let's strictly enforce - fail login if quota exceeded? Or maybe replace oldest?
                // The prompt says "IP address (upto 3 devices)", implying a constraint. 
                // Let's prevent login if it's a new device and quota is full, for security.
                // Or per standard "Netflix" style, maybe we just don't add it or we error? 
                // I'll return an error for now as strict interpretation.
                return res.status(403).json({ message: 'Maximum device limit reached (3 devices).' });
            } else {
                user.ipAddresses.push(ip);
                await user.save();
            }
        }

        // Create Token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token, user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        ipAddresses: user.ipAddresses
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- Profile Routes ---

// Get Current User Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update User Profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, gender, bloodGroup, phoneNumber, homeAddress, ipAddresses } = req.body;

        // Build profile object
        const profileFields = {};
        if (name) profileFields.name = name;
        if (gender) profileFields.gender = gender;
        if (bloodGroup) profileFields.bloodGroup = bloodGroup;
        if (phoneNumber) profileFields.phoneNumber = phoneNumber;
        if (homeAddress) profileFields.homeAddress = homeAddress;
        if (ipAddresses) {
            if (ipAddresses.length > 3) {
                return res.status(400).json({ message: 'You can only have up to 3 authorized IP addresses.' });
            }
            profileFields.ipAddresses = ipAddresses;
        }

        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Upload/Update Profile Photo
router.put('/profile/photo', auth, async (req, res) => {
    try {
        const { profilePhoto } = req.body;

        if (!profilePhoto) {
            return res.status(400).json({ message: 'No photo data provided' });
        }

        // Validate base64 size (limit to ~5MB)
        const sizeInBytes = Buffer.byteLength(profilePhoto, 'utf8');
        if (sizeInBytes > 5 * 1024 * 1024) {
            return res.status(400).json({ message: 'Photo size exceeds 5MB limit' });
        }

        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { profilePhoto } },
            { new: true }
        ).select('-password');

        res.json({ message: 'Profile photo updated successfully', profilePhoto: user.profilePhoto });
    } catch (err) {
        console.error('Profile photo upload error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Remove Profile Photo
router.delete('/profile/photo', auth, async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { profilePhoto: '' } },
            { new: true }
        ).select('-password');

        res.json({ message: 'Profile photo removed successfully' });
    } catch (err) {
        console.error('Profile photo remove error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update Emergency Contacts
router.put('/emergency-contacts', auth, async (req, res) => {
    try {
        const { emergencyContacts } = req.body;

        // Validate each contact has required fields
        if (emergencyContacts && Array.isArray(emergencyContacts)) {
            for (const contact of emergencyContacts) {
                if (!contact.name || !contact.phoneNumber || !contact.relation) {
                    return res.status(400).json({
                        message: 'Each contact must have name, phoneNumber, and relation'
                    });
                }
            }
        }

        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { emergencyContacts: emergencyContacts || [] } },
            { new: true }
        ).select('-password');

        res.json(user.emergencyContacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Emergency Contacts
router.get('/emergency-contacts', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('emergencyContacts');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.emergencyContacts || []);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Admin Middleware - Check if user is admin
const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Admin Dashboard Stats
router.get('/admin/stats', auth, adminAuth, async (req, res) => {
    try {
        // Total Users (excluding admins)
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        // Active Alerts
        const Alert = require('../models/Alert');
        const activeAlerts = await Alert.countDocuments({ status: 'Active' });

        // SOS Triggered Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sosToday = await Alert.countDocuments({
            createdAt: { $gte: today }
        });

        res.json({
            totalUsers,
            activeAlerts,
            sosToday
        });
    } catch (err) {
        console.error('Admin stats error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Recent Users (newly registered users)
router.get('/admin/recent-users', auth, adminAuth, async (req, res) => {
    try {
        const recentUsers = await User.find({ role: { $ne: 'admin' } })
            .select('name email createdAt')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(recentUsers);
    } catch (err) {
        console.error('Recent users error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get All Users (Admin Only)
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete User (Admin Only)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);

        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (userToDelete.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get Admin Reports (Last 30 Days Analytics)
router.get('/admin/reports', auth, adminAuth, async (req, res) => {
    try {
        const Alert = require('../models/Alert');
        const Community = require('../models/Community');
        const Booking = require('../models/Booking');
        const Location = require('../models/Location');

        // 30 days ago from now
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // --- SOS Alerts ---
        const newSosAlerts = await Alert.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        const casesResolved = await Alert.countDocuments({
            status: 'Resolved',
            updatedAt: { $gte: thirtyDaysAgo }
        });

        const falseAlarms = await Alert.countDocuments({
            status: 'False Alarm',
            updatedAt: { $gte: thirtyDaysAgo }
        });

        const activeAlerts = await Alert.countDocuments({
            status: 'Active'
        });

        // --- New Users ---
        const newUsers = await User.countDocuments({
            role: { $ne: 'admin' },
            createdAt: { $gte: thirtyDaysAgo }
        });

        // --- Community Posts ---
        const newCommunityPosts = await Community.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Community engagement - likes & comments in last 30 days
        const recentPosts = await Community.find({
            createdAt: { $gte: thirtyDaysAgo }
        }).select('likes comments');

        let totalLikes = 0;
        let totalComments = 0;
        recentPosts.forEach(post => {
            totalLikes += (post.likes ? post.likes.length : 0);
            totalComments += (post.comments ? post.comments.length : 0);
        });

        // --- Counselling Bookings ---
        const totalCounsellingBookings = await Booking.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        const completedBookings = await Booking.countDocuments({
            status: 'Completed',
            createdAt: { $gte: thirtyDaysAgo }
        });

        const cancelledBookings = await Booking.countDocuments({
            status: 'Cancelled',
            createdAt: { $gte: thirtyDaysAgo }
        });

        const pendingBookings = await Booking.countDocuments({
            status: 'Pending',
            createdAt: { $gte: thirtyDaysAgo }
        });

        const confirmedBookings = await Booking.countDocuments({
            status: 'Confirmed',
            createdAt: { $gte: thirtyDaysAgo }
        });

        // --- Location Updates ---
        const locationUpdates = await Location.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // --- Recent Activity Timeline ---
        // Get the 10 most recent events across collections
        const recentActivity = [];

        // Recent SOS alerts
        const recentSOS = await Alert.find({ createdAt: { $gte: thirtyDaysAgo } })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(3);
        recentSOS.forEach(alert => {
            recentActivity.push({
                type: 'sos',
                title: `SOS Alert Triggered`,
                description: `${alert.user?.name || 'Unknown user'} triggered an SOS alert - Status: ${alert.status}`,
                time: alert.createdAt
            });
        });

        // Recent Resolved
        const recentResolved = await Alert.find({
            status: 'Resolved',
            updatedAt: { $gte: thirtyDaysAgo }
        })
            .populate('user', 'name')
            .sort({ updatedAt: -1 })
            .limit(2);
        recentResolved.forEach(alert => {
            recentActivity.push({
                type: 'resolved',
                title: `Case Resolved`,
                description: `Alert for ${alert.user?.name || 'Unknown user'} was resolved`,
                time: alert.updatedAt
            });
        });

        // Recent users
        const latestUsers = await User.find({
            role: { $ne: 'admin' },
            createdAt: { $gte: thirtyDaysAgo }
        })
            .select('name createdAt')
            .sort({ createdAt: -1 })
            .limit(2);
        latestUsers.forEach(user => {
            recentActivity.push({
                type: 'user',
                title: `New User Registered`,
                description: `${user.name} joined SafeHer`,
                time: user.createdAt
            });
        });

        // Recent community posts
        const latestPosts = await Community.find({ createdAt: { $gte: thirtyDaysAgo } })
            .select('userName createdAt')
            .sort({ createdAt: -1 })
            .limit(2);
        latestPosts.forEach(post => {
            recentActivity.push({
                type: 'post',
                title: `New Community Post`,
                description: `${post.userName} shared a new post`,
                time: post.createdAt
            });
        });

        // Recent bookings
        const latestBookings = await Booking.find({ createdAt: { $gte: thirtyDaysAgo } })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(2);
        latestBookings.forEach(booking => {
            recentActivity.push({
                type: 'booking',
                title: `Counselling Booked`,
                description: `${booking.user?.name || 'User'} booked a counselling session - ${booking.status}`,
                time: booking.createdAt
            });
        });

        // Sort all activity by time descending
        recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json({
            newSosAlerts,
            newUsers,
            casesResolved,
            falseAlarms,
            activeAlerts,
            newCommunityPosts,
            totalLikes,
            totalComments,
            totalCounsellingBookings,
            completedBookings,
            cancelledBookings,
            pendingBookings,
            confirmedBookings,
            locationUpdates,
            recentActivity: recentActivity.slice(0, 10)
        });
    } catch (err) {
        console.error('Admin reports error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
