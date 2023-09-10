const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1d' });
        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

        const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1d' });
        res.json({ message: 'Logged in successfully', token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};