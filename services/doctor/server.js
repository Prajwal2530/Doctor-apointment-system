import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import doctorRoutes, { DOCTORS_SEED_DATA } from './routes/doctors.js';
import User from './models/User.js';
import client from "prom-client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Prometheus Metrics
client.collectDefaultMetrics();
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

app.use(cors());
app.use(express.json());

app.use('/', doctorRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'Doctor Service Running' });
});

const seedDoctors = async () => {
    const doctorCount = await User.countDocuments({ role: 'doctor' });

    if (doctorCount === 0) {
        console.log('--- SEEDING DOCTORS (DB is empty) ---');
        await User.create(DOCTORS_SEED_DATA);
        console.log(`✅ Seeded ${DOCTORS_SEED_DATA.length} doctors.`);
    } else {
        console.log(`✅ Found ${doctorCount} doctors in database. Skipping seed.`);
    }
};

connectDB().then(async () => {
    await seedDoctors();
    app.listen(PORT, () => {
        console.log(`Doctor Service running on port ${PORT}`);
    });
});
