const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Auth Middleware
const auth = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get all posts (with pagination)
router.get('/posts', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Community.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Community.countDocuments({ isActive: true });

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create a new post
router.post('/posts', auth, async (req, res) => {
    try {
        const { description, imageUrl, imageBase64, tags } = req.body;

        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        // Get user info
        const user = await User.findById(req.user.id).select('name');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newPost = new Community({
            user: req.user.id,
            userName: user.name,
            description,
            imageUrl: imageUrl || null,
            imageBase64: imageBase64 || null,
            tags: tags || [],
            likes: [],
            comments: []
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get a single post
router.get('/posts/:id', auth, async (req, res) => {
    try {
        const post = await Community.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete a post (only owner)
router.delete('/posts/:id', auth, async (req, res) => {
    try {
        const post = await Community.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user owns the post
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Community.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Like/Unlike a post
router.post('/posts/:id/like', auth, async (req, res) => {
    try {
        const post = await Community.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Get user name
        const user = await User.findById(req.user.id).select('name');

        // Check if already liked
        const likeIndex = post.likes.findIndex(
            like => like.user.toString() === req.user.id
        );

        if (likeIndex > -1) {
            // Unlike - remove like
            post.likes.splice(likeIndex, 1);
        } else {
            // Like - add like
            post.likes.push({ user: req.user.id, userName: user.name });
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add a comment
router.post('/posts/:id/comment', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Community.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Get user name
        const user = await User.findById(req.user.id).select('name');

        const newComment = {
            user: req.user.id,
            userName: user.name,
            text,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Delete a comment (only comment owner or post owner)
router.delete('/posts/:postId/comment/:commentId', auth, async (req, res) => {
    try {
        const post = await Community.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const commentIndex = post.comments.findIndex(
            c => c._id.toString() === req.params.commentId
        );

        if (commentIndex === -1) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const comment = post.comments[commentIndex];

        // Check if user is comment owner or post owner
        if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        post.comments.splice(commentIndex, 1);
        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get posts by user
router.get('/user/:userId/posts', auth, async (req, res) => {
    try {
        const posts = await Community.find({ user: req.params.userId, isActive: true })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
