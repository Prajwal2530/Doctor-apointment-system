import express from 'express';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to protect routes
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


// @desc    Fetch appointments for logged-in user (patient or doctor)
// @route   GET /api/appointments
// @access  Private
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

// @desc    Fetch appointments for a specific doctor
// @route   GET /api/appointments/doctor/:id
// @access  Private
router.get('/doctor/:id', protect, async (req, res) => {
  // Ensure the logged-in user is the doctor they are requesting appointments for
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


// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
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

// @desc    Cancel an appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
router.patch('/:id/cancel', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Ensure the logged in user is the patient for this appointment
        if (req.user.role !== 'patient' || appointment.patientId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        appointment.status = 'Cancelled';
        await appointment.save();
        res.json(appointment);
    } catch(error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update appointment status by doctor
// @route   PATCH /api/appointments/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
    const { status } = req.body;
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        // Ensure the logged in user is the doctor for this appointment
        if (req.user.role !== 'doctor' || appointment.doctorId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        appointment.status = status;
        await appointment.save();
        res.json(appointment);
    } catch(error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
