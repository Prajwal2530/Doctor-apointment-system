import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['patient', 'doctor', 'admin'],
            default: 'patient',
        },
        // Doctor-specific fields
        specialization: { type: String },
        availability: [{ type: String }],
        experience: { type: Number },
        fees: { type: Number },
        gender: { type: String, enum: ['Male', 'Female'] },
        languages: [{ type: String }],
        consultationModes: [{ type: String, enum: ['Hospital Visit', 'Online Consult'] }],
        facility: { type: String },
        location: { type: String },
        image: { type: String },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.password;
    },
});

const User = mongoose.model('User', userSchema);

export default User;
