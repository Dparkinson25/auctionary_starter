// User Controller
const crypto = require('crypto');
const user = require('../models/user.server.models.js');
const { token } = require("morgan");

// Placeholder for adding a new user
const create_account = (req, res) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(req.body.password, salt);

    

    const sql = "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?)";
    let values = [user.first_name, user.last_name, user.email, hash, salt];


    db.run(sql, values, function(err) {
        if (err) return done(err);
        return res.sendStatus(200);
    });
    
};


// Placeholder for logging in a user
const login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password; 
  user.authenticateUser(email, password, (err, userId) => {
    if (err) {
      if (err === 404) {
        return res.sendStatus(401); // Unauthorized
      }
      return res.sendStatus(500); // Server error
    }
    user.getToken(userId, (err, token) => {
      if (err) return res.sendStatus(500);
      if (token) {
        return res.status(200).json({ user_id: userId, session_token: token });
      } else {
        user.setToken(userId, (err, newToken) => {
          if (err) return res.sendStatus(500);
          return res.status(200).json({ user_id: userId, session_token: newToken });
        }); 
      }
    });
  });
};

// Placeholder for getting user details
const logout = (req, res) => {
  const token = req.get('X-Authorization');

  if (!token) {
    return res.sendStatus(400).send("Missing token"); // Unauthorized
  }

  user.removeToken(token, (err) => {
    if (err) return res.sendStatus(500).send("server error");
    return res.sendStatus(200);
  });
};

module.exports ={
  create_account:create_account,
  login:login,
  logout:logout
}