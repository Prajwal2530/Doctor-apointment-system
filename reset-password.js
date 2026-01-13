import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
    console.error("❌ MONGO_URI not found in .env");
    process.exit(1);
}

// Minimal Schema to avoid import issues
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
}, { strict: false }); // strict: false allows us to update other fields if needed, but we just need password

const User = mongoose.model('User', userSchema);

const resetPassword = async () => {
    try {
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        const email = 'mayu@clinic.com';
        const newPasswordPlain = 'password123';

        // Generate Hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPasswordPlain, salt);

        // Update User
        const result = await User.findOneAndUpdate(
            { email: { $regex: new RegExp(`^${email}$`, 'i') } },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (result) {
            console.log(`✅ successfully reset password for: ${result.email}`);
            console.log(`DETAILS:`);
            console.log(`- ID: ${result._id}`);
            console.log(`- New Password Hash: ${hashedPassword.substring(0, 20)}...`);
            console.log(`\n👉 You can now login with: '${newPasswordPlain}'`);
        } else {
            console.error(`❌ User '${email}' not found in the database.`);
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

resetPassword();
