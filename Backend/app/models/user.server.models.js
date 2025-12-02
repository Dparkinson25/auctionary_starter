// User Model

<<<<<<< HEAD
const mongoose = require('mongoose');
const crypto = require('crypto');
const user = require('../models/user.server.models.js');
=======
const db = require('../../config/database.js');
const crypto = require('crypto');
const user = require('./user.server.models.js');
>>>>>>> c65732f4fdcdf6fa4d735dacf89c8ba1d10b8c50
const { token } = require('morgan');


const getHash = (password,salt) => {
<<<<<<< HEAD
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
=======
 
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
>>>>>>> c65732f4fdcdf6fa4d735dacf89c8ba1d10b8c50
      return done(null, row.user_id);
    } else {
      return done(404);//wrong password
    }
  })
<<<<<<< HEAD
},

 getToken : (userId, done) => {
=======
}

const getToken = (userId, done) => {
>>>>>>> c65732f4fdcdf6fa4d735dacf89c8ba1d10b8c50
  const sql = 'SELECT session_token FROM users WHERE user_id = ?'; 
  db.get(sql, [userId], (err, row) => {
    if (err) return done(err);
    if (!row) return done(404);
    return done(null, row.session_token);
  });
<<<<<<< HEAD
},
 setToken : (userId, done) => {
  const token = crypto.randomBytes(64).toString('hex');

  const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';
  db.run(sql, [token, userId], (err) => {
    if (err) return done(err,token);
  });
}, 

 removeToken : (userId, done) => {
=======
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
>>>>>>> c65732f4fdcdf6fa4d735dacf89c8ba1d10b8c50
  const sql = 'UPDATE users SET session_token = null WHERE session_token = ?'; 
  db.run(sql, [token], (err) => {
    return done(err);
  }); 
<<<<<<< HEAD
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
=======
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
>>>>>>> c65732f4fdcdf6fa4d735dacf89c8ba1d10b8c50
