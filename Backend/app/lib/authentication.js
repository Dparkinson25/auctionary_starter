const db = require('../../database');

module.exports= function authenticateUser(req, res, next) {
    const token = req.get('X-Authorization') || req.headers['x-authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    db.get('SELECT * FROM users WHERE token = ?', [token], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = {user_id: row.user_id};
        next(); 
    });
};

