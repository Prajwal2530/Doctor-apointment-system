
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, password } = req.body;
  // Normalize email input
  const email = req.body.email ? req.body.email.trim() : '';

  // Check for user existence case-insensitively
  const userExists = await User.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, 'i') } 
  });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user (Schema will handle lowercasing for new records, but we pass it clean)
  const user = await User.create({
    name,
    email: email.toLowerCase(), 
    password,
    role: 'patient', // All new registrations are patients
  });

  if (user) {
    res.status(201).json({
      user,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { password } = req.body;
  // Normalize email input
  const email = req.body.email ? req.body.email.trim() : '';

  console.log(`Login Attempt: '${email}'`);

  // Use Regex for Case-Insensitive Match
  // This finds 'Mayu@clinic.com' even if you type 'mayu@clinic.com'
  const user = await User.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, 'i') } 
  });

  if (user) {
    if (await user.matchPassword(password)) {
        console.log(`✅ Login Successful for: ${user.email}`);
        res.json({
            user,
            token: generateToken(user._id),
        });
    } else {
        console.log(`❌ Login Failed: Incorrect Password for ${email}`);
        // Debug: Verify if the stored password looks like a Bcrypt hash
        if (user.password) {
             console.log(`   -> Stored Hash starts with: ${user.password.substring(0, 7)}... (Should be $2a$10$ or similar)`);
        } else {
             console.log(`   -> CRITICAL: No password stored for this user!`);
        }
        res.status(401).json({ message: 'Invalid email or password' });
    }
  } else {
    // DEBUGGING: If user not found, list what IS in the database to help the developer.
    console.log(`❌ Login Failed: User '${email}' NOT FOUND.`);
    try {
        const allUsers = await User.find({}, 'email');
        const existingEmails = allUsers.map(u => u.email);
        console.log(`   -> 🔍 Database currently contains ${allUsers.length} users: [${existingEmails.join(', ')}]`);
    } catch (err) {
        console.error("Error listing users for debug:", err);
    }
    
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ user });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
    // On the client-side, the token should be cleared from storage.
    res.status(200).json({ message: 'Logged out successfully' });
});


export default router;
