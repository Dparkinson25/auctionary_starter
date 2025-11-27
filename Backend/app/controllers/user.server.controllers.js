// User Controller
const crypto = require('crypto');
const user = require('../models/user.server.models.js');


// Placeholder for adding a new user
const create_account = (req, res) => {
    const { first_name,last_name,email,password, ...extraFields  } = req.body;
    if (Object.keys(extraFields).length > 0) {
        return res.status(400).json({error_message : "extra fields detected in request body."}); // Bad Request
    }
    if (!first_name) {
        return res.status(400).json({error_message : "first name has not had data entered."}); // Bad Request
    }
    if (!last_name) {
        return res.status(400).json({error_message : "last name has not had data entered."}); // Bad Request
    }
    if (!email) {
        return res.status(400).json({error_message : "email has not had data entered."}); // Bad Request
    }
    if (!password) {
        return res.status(400).json({error_message : "password has not had data entered."}); // Bad Request
    }

    const salt = crypto.randomBytes(64).toString('hex');
    const hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 64, 'sha512').toString('hex');

    
    const newUser = {
        first_name,
        last_name,
        email,
        password: hash,
        salt: salt
    };
    

    user.addNewUser(newUser, (err,userId) => {
        if (err) {
            console.error("Error adding new user:", err );
            return res.status(500).json({ error_message: "Internal server error" }); // Server Error
        }  
        return  res.status(201).json({ user_id: userId }); // Created 
    });
  
    
  
};

// Placeholder for logging in a user
const login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password; 
  if (!email || !password) {
    return res.status(400).json("Missing email or password"); // Bad Request
  }
  user.authenticateUser(email, password, (err, userId) => {
    if (err) {
      if (err === 404) {
        return res.status(401).json({ error_message: "invalid data"}); // Unauthorized
      }
      return res.status(500).json({error_message: "Internal server error"}); // Server error
    }
    user.getToken(userId, (err, token) => {
      if (err& err !== 404) return res.status(500).json({ error_message: "Internal server error" }); // Server error
      if (token) {
        return res.status(200).json({ user_id: userId, session_token: token });
      } else {
        user.setToken(userId, (err, newToken) => {
          if (err) return res.status(500).json({ error_message: "Internal server error" }); // Server error 

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
    return res.status(400).json({error_message:"Missing token"}); // Unauthorized
  }

  user.removeToken(token, (err) => {
    if (err) return res.status(500).json({error_message:"server error"});
    return res.status(200).json({error_message:"Logged out successfully"});
  });
};

module.exports ={
  create_account:create_account,
  login:login,
  logout:logout
}