/*
export const API_BASE_URL = 'http://localhost:5000/api';

import { Doctor, Role } from './types';

export const DOCTOR_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjRTJFOEYwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjUwIiAvPjxnIGZpbGw9IiNBMDBBRUMwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiIHIj0iMTUiIC8+PHBhdGggZD0iTTI1LDkwIEMyNSw3MCA3NSw3MCA3NSw5MCBaIiAvPjxwYXRoIGQ9Ik02OCw1MiBhMTgsMTggMCAwLDAtMzYsMCIgc3Ryb2tlPSIjQTAwQUVDMCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIiAvPjxjaXJjbGUgY3g9IjMwIiBjeT0iNTUiIHI9IjQiLz48Y2lyY2xlIGN4PSI3MCIgY3k9IjU1IiIHIj0iNCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iODAiIHI9IjgiIGZpbGw9IiNFMkU4RjAiIHN0cm9rZT0iI0EwMEFFQzAiIHN0cm9rZS13aWR0aD0iMyIvPjwvZz48L3N2Zz4=';

export const DOCTORS: Doctor[] = [
  {
    id: 'doc1',
    email: 'm.shendre@clinic.com',
    name: 'Dr. Mohan S Shendre',
    role: Role.Doctor,
    specialization: 'Dermatologist',
    availability: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
    experience: 10,
    fees: 350,
    gender: 'Male',
    languages: ['English', 'Hindi', 'Kannada'],
    consultationModes: ['Hospital Visit'],
    facility: 'Mohan Skin Care Clinic',
    location: 'Hubbali',
    image: 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg'
  },
  {
    id: 'doc2',
    email: 'm.math@clinic.com',
    name: 'Dr. Madhu S Math',
    role: Role.Doctor,
    specialization: 'Dentist',
    availability: ['09:30 AM', '10:30 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
    experience: 5,
    fees: 200,
    gender: 'Female',
    languages: ['English', 'Kannada'],
    consultationModes: ['Hospital Visit', 'Online Consult'],
    facility: 'Project Smile Dental Clinic',
    location: 'Dharwad',
    image: 'https://xsgames.co/randomusers/assets/avatars/female/74.jpg'
  },
  {
    id: 'doc3',
    email: 'v.chavan@clinic.com',
    name: 'Dr. Vinayak Chavan',
    role: Role.Doctor,
    specialization: 'Plastic Surgeon',
    availability: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM'],
    experience: 8,
    fees: 500,
    gender: 'Male',
    languages: ['English', 'Hindi'],
    consultationModes: ['Hospital Visit'],
    facility: 'Hubli Plastic And Cosmetic Surgery',
    location: 'Hubbali',
    image: 'https://xsgames.co/randomusers/assets/avatars/male/75.jpg'
  },
  {
    id: 'doc4',
    email: 'm.khanum@clinic.com',
    name: 'Dr. Musaddiqa Khanum',
    role: Role.Doctor,
    specialization: 'General Practitioner',
    availability: ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
    experience: 18,
    fees: 500,
    gender: 'Female',
    languages: ['English', 'Telugu', 'Hindi'],
    consultationModes: ['Online Consult'],
    facility: 'Vishwas Clinic',
    location: 'Hubbali',
    image: 'https://xsgames.co/randomusers/assets/avatars/female/75.jpg'
  },
    {
    id: 'doc5',
    email: 't.khan@clinic.com',
    name: 'Dr. Tabrez Khan',
    role: Role.Doctor,
    specialization: 'General Practitioner',
    availability: ['10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM'],
    experience: 3,
    fees: 150,
    gender: 'Male',
    languages: ['English', 'Hindi'],
    consultationModes: ['Hospital Visit', 'Online Consult'],
    facility: 'Apollo Hospital',
    location: 'Hubbali',
    image: '' // No image provided, to test fallback
  },
]; 

*/

import { Doctor, Role } from './types';

export const DOCTOR_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjRTJFOEYwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjUwIiAvPjxnIGZpbGw9IiNBMDBBRUMwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiIHIj0iMTUiIC8+PHBhdGggZD0iTTI1LDkwIEMyNSw3MCA3NSw3MCA3NSw5MCBaIiAvPjxwYXRoIGQ9Ik02OCw1MiBhMTgsMTggMCAwLDAtMzYsMCIgc3Ryb2tlPSIjQTAwQUVDMCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIiAvPjxjaXJjbGUgY3g9IjMwIiBjeT0iNTUiIHI9IjQiLz48Y2lyY2xlIGN4PSI3MCIgY3k9IjU1IiIHIj0iNCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iODAiIHI9IjgiIGZpbGw9IiNFMkU4RjAiIHN0cm9rZT0iI0EwMEFFQzAiIHN0cm9rZS13aWR0aD0iMyIvPjwvZz48L3N2Zz4=';

export const API_BASE_URL = 'http://localhost:5000';
