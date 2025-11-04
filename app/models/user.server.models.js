// User Model

const mongoose = require('mongoose');
const { token } = require('morgan');

const getHash = (password,salt) => {
  // Placeholder for password hashing logic
  return crypto.pkdf2Sync(password, salt, 10000, 64, 'sha512').tostring('hex');
}

const addNewUser = (user,done) => {
  const sql = "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)";
  let values = [user.first_name, user.last_name, user.email, Hash, salt.toString('hex')];  
  db.run(sql, values, function(err) {
      if (err) return done(err);
      return done(null);
  });

}

const authenticateUser = (email,password,done) => {
  const sql = 'SELECT user_id, password, salt FROM users WHERE email = ?';

  db.get(sql, [email], (err, row) => {
    if (err) return done(err)
    if (!row) return done(404)

    if (row.salt === null) row.salt = ''

    let salt = buffer.from(row.salt, 'hex');

    if (row.password === getHash(password, salt)) {
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
  let token = crypto.randomBytes(16).toString('hex');

  const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';
  db.run(sql, [token, userId], (err) => {
    if (err) return done(err,token);
  });
} 

const removeToken = (userId, done) => {
  const sql = 'UPDATE users SET session_token = null WHERE session_token = ?'; 
  db.run(sql, [token], (err) => {
    return done(err);
  }); 
}

const IsAuthenticated = function(req, res, next) {
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
module.exports = mongoose.model('User', userSchema);