import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import client from "prom-client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Prometheus Metrics
client.collectDefaultMetrics();
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'Auth Service Running' });
});

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
