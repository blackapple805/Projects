// backend/src/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Validate input
    if(!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Optionally, you can generate a JWT here, but for now we’ll just send back user info
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
