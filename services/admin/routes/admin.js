import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { DOCTORS_SEED_DATA } from '../data/doctors.js';

const router = express.Router();

const parseArray = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === 'string') return input.split(',').map(s => s.trim()).filter(s => s);
    return [];
};

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/users/:id/role', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = req.body.role || user.role;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/doctors/:id', protect, admin, async (req, res) => {
    const { name, email, password, specialization, experience, fees, availability, languages, consultationModes, facility, location, image } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        user.name = name || user.name;
        if (email) {
            user.email = email.toLowerCase().trim();
        }

        if (password && password.trim() !== '') {
            user.password = password;
        }

        user.specialization = specialization || user.specialization;
        user.experience = experience !== undefined ? Number(experience) : user.experience;
        user.fees = fees !== undefined ? Number(fees) : user.fees;
        user.facility = facility || user.facility;
        user.location = location || user.location;
        user.image = image || user.image;

        if (availability) user.availability = parseArray(availability);
        if (languages) user.languages = parseArray(languages);
        if (consultationModes) user.consultationModes = parseArray(consultationModes);

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid doctor data' });
    }
});

router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/reset-doctors', protect, admin, async (req, res) => {
    try {
        await User.deleteMany({ role: 'doctor' });
        await User.create(DOCTORS_SEED_DATA);
        res.status(200).json({ message: 'Doctors have been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error while resetting doctors' });
    }
});

router.post('/add-doctor', protect, admin, async (req, res) => {
    const { name, email, password, specialization, experience, fees, availability, languages, consultationModes, facility, location, image } = req.body;

    const emailInput = email ? email.trim() : '';

    if (!emailInput) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const userExists = await User.findOne({
        email: { $regex: new RegExp(`^${emailInput}$`, 'i') }
    });

    if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    try {
        const doctor = await User.create({
            name,
            email: emailInput.toLowerCase(),
            password,
            role: 'doctor',
            specialization,
            experience: Number(experience),
            fees: Number(fees),
            availability: parseArray(availability),
            languages: parseArray(languages),
            consultationModes: parseArray(consultationModes),
            facility,
            location,
            image
        });
        console.log(`✅ New Doctor Created Successfully: ${doctor.email}`);
        res.status(201).json(doctor);
    } catch (error) {
        console.error("Error creating doctor:", error);
        res.status(400).json({ message: 'Invalid doctor data provided' });
    }
});

export default router;
