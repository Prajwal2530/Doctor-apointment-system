
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/User.js';
import { DOCTORS_SEED_DATA } from './routes/doctors.js';

import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctors.js';
import appointmentRoutes from './routes/appointments.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

// Connect to database THEN seed THEN start server
connectDB().then(async () => {
  try {
    console.log('--- DATABASE CONNECTION SUCCESSFUL ---');
    console.log('--- STARTING USER SEEDING ---');
    
    // 1. RESET ADMIN ACCOUNT
    // Delete existing admin to ensure a clean slate
    await User.deleteOne({ email: 'admin@medibook.com' });
    
    // Create fresh admin
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@medibook.com',
      password: 'admin123', // Will be hashed by User model pre-save hook
      role: 'admin'
    });
    await admin.save();
    console.log('✅ Admin Access Configured: admin@medibook.com / admin123');

    // 2. RESET DOCTOR ACCOUNTS
    // Get list of seed emails
    const doctorEmails = DOCTORS_SEED_DATA.map(d => d.email);
    
    // Remove existing seed doctors to prevent duplicates or stale data
    await User.deleteMany({ email: { $in: doctorEmails } });
    
    // Re-create doctors
    for (const docData of DOCTORS_SEED_DATA) {
        // User.create triggers the pre-save hook automatically
        await User.create(docData);
    }
    console.log('✅ Seed Doctors Reset. Password for all: password123');
    
    console.log('--- SEEDING COMPLETE ---');
    
    // 3. DISPLAY CURRENT USER INVENTORY
    // This helps developers verify that manually added users (like your new doctor) are actually saved.
    const allUsers = await User.find({}, 'name email role');
    console.log('\n📊 CURRENT USER INVENTORY (DATABASE SNAPSHOT):');
    const tableData = allUsers.map(u => ({ 
        Name: u.name, 
        Email: u.email, 
        Role: u.role 
    }));
    console.table(tableData);
    console.log('---------------------------------------------------------------\n');

    // 4. START SERVER
    // Only start listening after DB and Seed are ready to avoid race conditions
    app.listen(PORT, console.log(`🚀 Server running on port ${PORT}`));
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR during startup:', error);
    process.exit(1);
  }
});
