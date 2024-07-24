const User = require('../models/User');
const jwt = require('jsonwebtoken');
const keys = process.env.JWT_SECRET  

exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        user = new User({ username, email, password, role });
        await user.save();

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, keys, { expiresIn: '1h' });

        res.status(201).json({ token, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, keys, { expiresIn: '1h' });

        res.json({ token, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
