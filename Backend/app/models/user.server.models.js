// User Model

const db = require('../../database');
const crypto = require('crypto');
const user = require('./user.server.models.js');



const getHash = (password,salt) => {
 
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

const addNewUser = (user,done) => {
  const sql = "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)";
  let values = [user.first_name, user.last_name, user.email, user.password, user.salt];  
  db.run(sql, values, function(err) {
      if (err) return done(err);
      return done(null, this.lastID);
  });

}

const authenticateUser = (email,password,done) => {
  const sql = 'SELECT user_id, password, salt FROM users WHERE email = ?';

  db.get(sql, [email], (err, row) => {
    if (err) return done(err);
    if (!row) return done(404);

    if (row.salt === null) row.salt = ''

    const salt = Buffer.from(row.salt, 'hex');
    const hash= getHash(password, salt);

    if (row.password === (password, hash)) {
      return done(null, row.user_id);
    } else {
      return done(404);//wrong password
    }
  })
}

const getToken = (userId, done) => {
  const sql = 'SELECT session_token FROM users WHERE user_id = ?'; 
  db.get(sql, [userId], (err, row) => {
    if (err) return done(err);
    if (!row) return done(404);
    return done(null, row.session_token);
  });
}
const setToken = (userId, done) => {
  const token = crypto.randomBytes(16).toString('hex');

  const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';
  db.run(sql, [token, userId], (err) => {
    if (err) return done(err);
    return done(null, token);
  });
} 

const removeToken = (token , done) => {
  const sql = 'UPDATE users SET session_token = null WHERE session_token = ?'; 
  db.run(sql, [token], (err) => {
    return done(err);
  }); 
}

const getUserIdFromToken = (token, done) => {
  const sql = 'SELECT user_id FROM users WHERE session_token = ?';
  db.get(sql, [token], (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, null);
    return done(null, row.user_id);
  });
};

const IsAuthenticated = function(req, res, next) {
  const token = req.get('X-Authorization');
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }
  getUserIdFromToken(token, (err, userId) => {
    if (err) {
      console.error("Error getting user ID from token:", err);
      return res.sendStatus(500); // Server error
    }
    if (!userId) {
      return res.sendStatus(401); // Unauthorized
    }
    req.userId = userId;
    next();
  });
}
module.exports = {
  addNewUser,
  authenticateUser,
  getToken,
  setToken,
  removeToken,
  IsAuthenticated
};
exports.getUserById = (userId) => {
  return { userId, username: 'sampleUser'};
};
exports.createUser = (username,email,password) => {
  return { userId: 1, username, email };
};