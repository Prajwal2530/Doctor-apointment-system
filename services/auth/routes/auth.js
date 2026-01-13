import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/register', async (req, res) => {
    const { name, password } = req.body;
    const email = req.body.email ? req.body.email.trim() : '';

    const userExists = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'patient',
    });

    if (user) {
        res.status(201).json({
            user,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

router.post('/login', async (req, res) => {
    const { password } = req.body;
    const email = req.body.email ? req.body.email.trim() : '';

    const user = await User.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (user && (await user.matchPassword(password))) {
        res.json({
            user,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

router.get('/me', protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({ user });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
