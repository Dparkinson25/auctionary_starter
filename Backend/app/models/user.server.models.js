// User Model

const mongoose = require('mongoose');
const crypto = require('crypto');
const user = require('../models/user.server.models.js');
const { token } = require('morgan');


const getHash = (password,salt) => {
  // Placeholder for password hashing logic
  return crypto.pkdf2Sync(password, salt, 10000, 64, 'sha512').tostring('hex');
}

const UserModel = {
  addNewUser : (user,done) => {
  const salt = crypto.randomBytes(64);
  const Hash = getHash(user.password, salt);
  const sql = "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)";
  let values = [user.first_name, user.last_name, user.email, Hash, salt.toString('hex')];  
  db.run(sql, values, function(err) {
      if (err) return done(err);
      return done(null);
  });

},

authenticateUser:(email,password,done) => {
  const sql = 'SELECT user_id, password, salt FROM users WHERE email = ?';

  db.get(sql, [email], (err, row) => {
    if (err) return done(err)
    if (!row) return done(new error("User not found"));

    if (row.salt === null) row.salt = ''

    let salt = buffer.from(row.salt, 'hex');

    if (row.password === getHash(password, salt)) {
      return done(null, row.user_id);
    } else {
      return done(404);//wrong password
    }
  })
},

 getToken : (userId, done) => {
  const sql = 'SELECT session_token FROM users WHERE user_id = ?'; 
  db.get(sql, [userId], (err, row) => {
    if (err) return done(err);
    if (!row) return done(404);
    return done(null, row.session_token);
  });
},
 setToken : (userId, done) => {
  const token = crypto.randomBytes(64).toString('hex');

  const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';
  db.run(sql, [token, userId], (err) => {
    if (err) return done(err,token);
  });
}, 

 removeToken : (userId, done) => {
  const sql = 'UPDATE users SET session_token = null WHERE session_token = ?'; 
  db.run(sql, [token], (err) => {
    return done(err);
  }); 
},

 IsAuthenticated : function(req, res, next) {
  let token = req.get('X-Authorization');
  users.getIdFromToken(token, (err, userId) => {
    const sql = 'SELECT user_id FROM users WHERE session_token = ?';
    const params = [token];
    if (err || userId === null) {
      return res.sendStatus(401);
    }
    next();
  });
}
};
module.exports = mongoose.model('User', userModel);