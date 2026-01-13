import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import dotenv from 'dotenv';
import client from 'prom-client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Prometheus Metrics
client.collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.use(cors());
app.use(express.json());

// Service URLs (from env or default for local k8s)
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
const DOCTOR_SERVICE = process.env.DOCTOR_SERVICE_URL || 'http://doctor-service:5002';
const APPOINTMENT_SERVICE = process.env.APPOINTMENT_SERVICE_URL || 'http://appointment-service:5003';
const ADMIN_SERVICE = process.env.ADMIN_SERVICE_URL || 'http://admin-service:5004';

// Health Check
app.get('/', (req, res) => {
    res.send('Gateway Service Running');
});

// Proxy Routes
app.use('/api/auth', proxy(AUTH_SERVICE));
app.use('/api/doctors', proxy(DOCTOR_SERVICE));
app.use('/api/appointments', proxy(APPOINTMENT_SERVICE));
app.use('/api/admin', proxy(ADMIN_SERVICE));

app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
    console.log(`Proxies: Auth->${AUTH_SERVICE}, Doctor->${DOCTOR_SERVICE}, Appt->${APPOINTMENT_SERVICE}, Admin->${ADMIN_SERVICE}`);
});
