import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import appointmentRoutes from './routes/appointments.js';
import client from "prom-client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Prometheus Metrics
client.collectDefaultMetrics();
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

app.use(cors());
app.use(express.json());

connectDB();

app.use('/', appointmentRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'Appointment Service Running' });
});

app.listen(PORT, () => {
    console.log(`Appointment Service running on port ${PORT}`);
});
