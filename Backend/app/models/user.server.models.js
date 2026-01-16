const db = require('../../database');
const crypto = require('crypto');

const generateSalt = () => crypto.randomBytes(16).toString('hex');

const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
};

const createUser = (user, done) => {
  const salt = generateSalt();
  const hash = hashPassword(user.password, salt);
  const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)';
  const values = [user.first_name, user.last_name, user.email, hash, salt];
  db.run(sql, values, function (err) {
    if (err) return done(err);
    return done(null, this.lastID);
  });
};

const authenticateUser = (email, password, done) => {
  const sql = 'SELECT user_id, password, salt FROM users WHERE email = ?';
  db.get(sql, [email], (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, null);
    const hash = hashPassword(password, row.salt);
    if (row.password === hash) return done(null, row.user_id);
    return done(null, null);
  });
};

const getToken = (userId, done) => {
  const sql = 'SELECT session_token FROM users WHERE user_id = ?';
  db.get(sql, [userId], (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, null);
    return done(null, row.session_token);
  });
};

const setToken = (userId, done) => {
  const token = crypto.randomBytes(32).toString('hex');
  const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';
  db.run(sql, [token, userId], function (err) {
    if (err) return done(err);
    return done(null, token);
  });
};

const removeToken = (token, done) => {
  const sql = 'UPDATE users SET session_token = NULL WHERE session_token = ?';
  db.run(sql, [token], function (err) {
    if (err) return done(err);
    return done(null);
  });
};

const getUserById = (userId, done) => {
  const sql = 'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?';
  db.get(sql, [userId], (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, null);
    return done(null, {
      user_id: row.user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
    });
  });
};

const getAllUsers = (done) => {
  const sql = 'SELECT user_id, first_name, last_name, email FROM users';
  db.all(sql, [], (err, rows) => {
    if (err) return done(err);
    const users = rows.map((row) => ({
      user_id: row.user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
    }));
    return done(null, users);
  });
};

const getUserIdFromToken = (token, done) => {
  const sql = 'SELECT user_id FROM users WHERE session_token = ?';
  db.get(sql, [token], (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, null);
    return done(null, row.user_id);
  });
};

module.exports = {
  createUser,
  authenticateUser,
  getToken,
  setToken,
  removeToken,
  getUserById,
  getAllUsers,
  getUserIdFromToken,
};
