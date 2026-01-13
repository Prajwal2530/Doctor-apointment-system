import express from 'express';
import User from '../models/User.js';

const router = express.Router();

export const DOCTORS_SEED_DATA = [
    {
        name: 'Dr. Mohan S Shendre',
        email: 'm.shendre@clinic.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Dermatologist',
        availability: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
        experience: 10, fees: 350, gender: 'Male',
        languages: ['English', 'Hindi', 'Kannada'],
        consultationModes: ['Hospital Visit'],
        facility: 'Mohan Skin Care Clinic', location: 'Hubbali',
        image: 'https://i.pinimg.com/736x/36/62/17/3662178c1c2af856222af424a7c5775d.jpg'
    },
    {
        name: 'Dr. Madhu S Math',
        email: 'm.math@clinic.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Dentist',
        availability: ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
        experience: 5, fees: 200, gender: 'Female',
        languages: ['English', 'Kannada'],
        consultationModes: ['Hospital Visit', 'Online Consult'],
        facility: 'Project Smile Dental Clinic', location: 'Dharwad',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=250'
    },
    {
        name: 'Dr. Vinayak Chavan',
        email: 'v.chavan@clinic.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'Plastic Surgeon',
        availability: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM'],
        experience: 8, fees: 500, gender: 'Male',
        languages: ['English', 'Hindi'],
        consultationModes: ['Hospital Visit'],
        facility: 'Hubli Plastic And Cosmetic Surgery', location: 'Hubbali',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16e?q=80&w=250'
    },
    {
        name: 'Dr. Musaddiqa Khanum',
        email: 'm.khanum@clinic.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'General Practitioner',
        availability: ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
        experience: 18, fees: 500, gender: 'Female',
        languages: ['English', 'Telugu', 'Hindi'],
        consultationModes: ['Online Consult'],
        facility: 'Vishwas Clinic', location: 'Hubbali',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250'
    },
    {
        name: 'Dr. Tabrez Khan',
        email: 't.khan@clinic.com',
        password: 'password123',
        role: 'doctor',
        specialization: 'General Practitioner',
        availability: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM'],
        experience: 3, fees: 150, gender: 'Male',
        languages: ['English', 'Hindi'],
        consultationModes: ['Hospital Visit', 'Online Consult'],
        facility: 'Apollo Hospital', location: 'Hubbali',
        image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=250'
    }
];

router.get('/', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' });
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
