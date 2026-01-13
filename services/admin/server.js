import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import adminRoutes from './routes/admin.js';
import User from './models/User.js';
import client from "prom-client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;

// Prometheus Metrics
client.collectDefaultMetrics();
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

app.use(cors());
app.use(express.json());

app.use('/', adminRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'Admin Service Running' });
});

const ensureAdminExists = async () => {
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
        console.log('✅ Admin Account Verified');
    }
};

connectDB().then(async () => {
    await ensureAdminExists();
    app.listen(PORT, () => {
        console.log(`Admin Service running on port ${PORT}`);
    });
});
