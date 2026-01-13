import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

console.log("Testing connection to:", uri?.split('@')[1]); // Log only the host part for privacy

if (!uri) {
    console.error("MONGO_URI not found in .env");
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log("✅ SUCCESS: Connected to MongoDB successfully!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ FAILURE: Connection failed.");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.message.includes('bad auth')) {
            console.error("\nPossible Causes:");
            console.error("1. Invalid Username or Password");
            console.error("2. IP Address not whitelisted in MongoDB Atlas (Network Access)");
            console.error("3. User does not have privileges for this database");
        }
        process.exit(1);
    });
