
const userModel = require('../models/user.server.models.js');
const db = require('../../database');

const create_account = (req, res) => {
  const { first_name, last_name, email, password, ...extraFields } = req.body;
  if (Object.keys(extraFields).length > 0) {
    return res.status(400).json({ error_message: 'extra fields detected in request body.' });
  }
  if (!first_name) return res.status(400).json({ error_message: 'first name has not had data entered.' });
  if (!last_name) return res.status(400).json({ error_message: 'last name has not had data entered.' });
  if (!email) return res.status(400).json({ error_message: 'email has not had data entered.' });
  if (!password) return res.status(400).json({ error_message: 'password has not had data entered.' });

  const newUser = { first_name, last_name, email, password };

  
  if (typeof password !== 'string') return res.status(400).json({ error_message: 'password does not meet complexity requirements.' });
  if (password.length < 8) return res.status(400).json({ error_message: 'password does not meet complexity requirements.' });
  if (password.length > 40) return res.status(400).json({ error_message: 'password does not meet complexity requirements.' });
  if (!/[0-9]/.test(password)) return res.status(400).json({ error_message: 'password does not meet complexity requirements.' });
  if (!/[!@#$%^&*()\-_=+\[\]{};:'"\\|,.<>\/?`~]/.test(password)) return res.status(400).json({ error_message: 'password does not meet complexity requirements.' });
  if (!/[A-Z]/.test(password)) return res.status(400).json({ error_message: 'password does not meet complexity requirements.' });
  if (!/[a-z]/.test(password)) return res.status(400).json({ error_message: 'password does not meet complexity requirements.' });

  userModel.createUser(newUser, (err, userId) => {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error_message: 'Email already in use' });
      }
      return res.status(500).json({ error_message: 'Internal server error' });
    }
    return res.status(201).json({ user_id: userId });
  });
};

const login = (req, res) => {
  const { email, password, ...extra } = req.body;
  if (Object.keys(extra).length > 0) return res.status(400).json({ error_message: 'extra fields detected in request body.' });
  if (!email || !password) return res.status(400).json({ error_message: 'Missing email or password' });

  userModel.authenticateUser(email, password, (err, userId) => {
    if (err) return res.status(500).json({ error_message: 'Internal server error' });
    if (!userId) return res.status(400).json({ error_message: 'Invalid email or password' });

    userModel.getToken(userId, (err, token) => {
      if (err) return res.status(500).json({ error_message: 'Internal server error' });
      if (token) return res.status(200).json({ user_id: userId, session_token: token });

      userModel.setToken(userId, (err, newToken) => {
        if (err) return res.status(500).json({ error_message: 'Internal server error' });
        return res.status(200).json({ user_id: userId, session_token: newToken });
      });
    });
  });
};

const logout = (req, res) => {
  const token = req.get('X-Authorization');
  if (!token) return res.status(401).json({ error_message: 'Missing token' });

  userModel.getUserIdFromToken(token, (err, userId) => {
    if (err) return res.status(500).json({ error_message: 'Internal server error' });
    if (!userId) return res.status(401).json({ error_message: 'Invalid token' });

    userModel.removeToken(token, (err) => {
      if (err) return res.status(500).json({ error_message: 'server error' });
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  });
};

const getUserDetails = (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) return res.status(400).json({ error_message: 'Invalid user id' });

  userModel.getUserById(userId, (err, user) => {
    if (err) return res.status(500).json({ error_message: 'Internal server error' });
    if (!user) return res.status(404).json({ error_message: 'User not found' });

    const now = Date.now();

    const sellingSql = `SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
                        FROM items i JOIN users u ON i.creator_id = u.user_id
                        WHERE i.creator_id = ? ORDER BY i.item_id ASC`;

    const biddingSql = `SELECT DISTINCT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
                        FROM bids b JOIN items i ON b.item_id = i.item_id JOIN users u ON i.creator_id = u.user_id
                        WHERE b.user_id = ? ORDER BY i.item_id ASC`;

    const endedSql = `SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
                      FROM items i JOIN users u ON i.creator_id = u.user_id
                      WHERE i.creator_id = ? AND i.end_date < ? ORDER BY i.item_id ASC`;

    db.all(sellingSql, [userId], (err, sellingRows) => {
      if (err) return res.status(500).json({ error_message: 'Internal server error' });

      db.all(biddingSql, [userId], (err, biddingRows) => {
        if (err) return res.status(500).json({ error_message: 'Internal server error' });

        db.all(endedSql, [userId, now], (err, endedRows) => {
          if (err) return res.status(500).json({ error_message: 'Internal server error' });

          return res.status(200).json({
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            selling: sellingRows || [],
            bidding_on: biddingRows || [],
            auctions_ended: endedRows || []
          });
        });
      });
    });
  });
};

const getAllUsers = (req, res) => {
  userModel.getAllUsers((err, users) => {
    if (err) return res.status(500).json({ error_message: 'Internal server error' });
    return res.status(200).json({ users });
  });
};

module.exports = {
  create_account,
  login,
  logout,
  getAllUsers,
  getUserDetails,
};

