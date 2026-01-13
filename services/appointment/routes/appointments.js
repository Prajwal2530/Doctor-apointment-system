import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/stats', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as admin' });
    }
    try {
        const stats = await Appointment.aggregate([
            {
                $group: {
                    _id: '$doctorId',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statsMap = stats.reduce((acc, curr) => {
            // Ensure ID is string to match frontend doctor.id
            const id = curr._id.toString();
            acc[id] = curr.count;
            return acc;
        }, {});

        res.json(statsMap);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: 'Server Error fetching stats' });
    }
});

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
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'patient'
            ? { patientId: req.user._id }
            : { doctorId: req.user._id };

        const appointments = await Appointment.find(query);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/doctor/:id', protect, async (req, res) => {
    if (req.user.role !== 'doctor' || req.user._id.toString() !== req.params.id) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    try {
        const appointments = await Appointment.find({ doctorId: req.params.id });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/', protect, async (req, res) => {
    if (req.user.role !== 'patient') {
        return res.status(401).json({ message: 'Only patients can book appointments' });
    }
    const { doctorId, date, time, reason } = req.body;
    const doctor = await User.findById(doctorId);

    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = new Appointment({
        patientId: req.user._id,
        patientName: req.user.name,
        doctorId,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        date,
        time,
        reason,
        status: 'Pending',
    });

    try {
        const createdAppointment = await appointment.save();
        res.status(201).json(createdAppointment);
    } catch (error) {
        res.status(400).json({ message: 'Invalid appointment data' });
    }
});

router.patch('/:id/cancel', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (req.user.role !== 'patient' || appointment.patientId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        appointment.status = 'Cancelled';
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.patch('/:id/status', protect, async (req, res) => {
    const { status } = req.body;
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (req.user.role !== 'doctor' || appointment.doctorId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        appointment.status = status;
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/stats', protect, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as admin' });
    }
    try {
        const stats = await Appointment.aggregate([
            {
                $group: {
                    _id: '$doctorId',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert array [{_id: 'docId', count: 5}] to object {'docId': 5}
        const statsMap = stats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.json(statsMap);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: 'Server Error fetching stats' });
    }
});

export default router;
