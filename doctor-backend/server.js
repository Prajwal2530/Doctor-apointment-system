
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

// Allow all origins for simplicity in deployment
app.use(cors({
  origin: '*',
  credentials: true
}));

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
    console.log('--- CHECKING DATA INTEGRITY ---');
    
    // 1. ENSURE ADMIN ACCOUNT EXISTS
    const adminEmail = 'admin@medibook.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
        const admin = new User({
          name: 'Super Admin',
          email: adminEmail,
          password: 'admin123',
          role: 'admin'
        });
        await admin.save();
        console.log('✅ Admin Account Created: admin@medibook.com / admin123');
    } else {
        console.log('✅ Admin Account Verified (Preserved)');
    }

    // 2. SEED DOCTORS ONLY IF NONE EXIST
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    
    if (doctorCount === 0) {
        console.log('--- SEEDING DOCTORS (DB is empty) ---');
        await User.create(DOCTORS_SEED_DATA);
        console.log(`✅ Seeded ${DOCTORS_SEED_DATA.length} doctors.`);
    } else {
        console.log(`✅ Found ${doctorCount} doctors in database. Skipping seed to preserve Admin changes.`);
    }
    
    // 3. DISPLAY CURRENT USER INVENTORY
    const allUsers = await User.find({}, 'name email role');
    console.log('\n📊 CURRENT USER INVENTORY:');
    const tableData = allUsers.map(u => ({ 
        Name: u.name, 
        Email: u.email, 
        Role: u.role 
    }));
    console.table(tableData);
    console.log('---------------------------------------------------------------\n');

    // 4. START SERVER
    app.listen(PORT, console.log(`🚀 Server running on port ${PORT}`));
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR during startup:', error);
    process.exit(1);
  }
});
