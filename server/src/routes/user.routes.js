import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller.js';
import { protect } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import House from '../models/House.js';

const router = express.Router();

// Register new user
router.post('/register', registerUser);

// Login user (sets JWT cookie)
router.post('/login', loginUser);

// ✅ Get logged-in user's profile (protected)
router.get('/me', protect, async (req, res) => {
  try {
    // Get user without password
    const user = req.user.toObject();
    delete user.password;
    
    // Find house where user is a member
    const house = await House.findOne({ 
      members: req.user._id 
    }).populate('members', 'name email');
    
    // Add house to user object
    user.house = house;
    
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// ✅ Logout user (clears cookie)
router.post('/logout', logoutUser);

export default router;
