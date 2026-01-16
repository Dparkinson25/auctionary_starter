const userModel = require('../models/user.server.models');

const authenticateUser = (req, res, next) => {
    const token = req.get('X-Authorization');
    if (!token) {
        return res.status(401).json({ error_message: 'Missing token' });
    }

    userModel.getUserIdFromToken(token, (err, userId) => {
        if (err) {
            console.error('Error getting user ID from token:', err);
            return res.status(500).json({ error_message: 'Internal server error' });
        }
        if (!userId) {
            return res.status(401).json({ error_message: 'Invalid token' });
        }
        req.user = { id: userId };
        next();
    });
};

module.exports = {
    authenticateUser,
};

