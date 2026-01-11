
const crypto = require('crypto');
const userModel = require('../models/user.server.models.js');



const create_account = (req, res) => {
    const { first_name,last_name,email,password, ...extraFields  } = req.body;
    if (Object.keys(extraFields).length > 0) {
        return res.status(400).json({error_message : 'extra fields detected in request body.'}); // Bad Request
    }
    if (!first_name) {
        return res.status(400).json({error_message : 'first name has not had data entered.'}); 
    }
    if (!last_name) {
        return res.status(400).json({error_message : 'last name has not had data entered.'}); 
    }
    if (!email) {
        return res.status(400).json({error_message : 'email has not had data entered.'}); 
    }
    if (!password) {
        return res.status(400).json({error_message : 'password has not had data entered.'}); 
    }

    const salt = crypto.randomBytes(64).toString('hex');
    const hash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 64, 'sha512').toString('hex');

    
    const newUser = {
        first_name,
        last_name,
        email,
        password: hash,
        salt
    };
    

    userModel.createUser(newUser, (err,userId) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              return res.status(400).json({ error_message: 'Email already in use' }); // Bad Request
            }
            return res.status(500).json({ error_message: 'Internal server error' }); // Server Error
        }  
        return  res.status(201).json({ user_id: userId }); // Created 
    });
  
    
  
};


const login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password; 
  if (!email || !password) {
    return res.status(400).json({ error_message: 'Missing email or password' }); // Bad Request
  }
  userModel.authenticateUser(email, password, (err, userId) => {
    if (err) {
     
      return res.status(500).json({error_message: 'Internal server error'}); // Server error
    }
    if (!userId) {
      return res.status(401).json({ error_message: 'Invalid email or password' }); // Unauthorized
    }
    userModel.getToken(userId, (err, token) => {
      if (err) return res.status(500).json({ error_message: 'Internal server error' }); 
      if (token) {
        return res.status(200).json({ user_id: userId, session_token: token });
      } 

        userModel.setToken(userId, (err, newToken) => {
          if (err) return res.status(500).json({ error_message: 'Internal server error' }); 

          return res.status(200).json({ user_id: userId, session_token: newToken });
          
        }); 
  
    });
  });
};

// Placeholder for getting user details
const logout = (req, res) => {
  const token = req.get('X-Authorization');

  if (!token) {
    return res.status(400).json({error_message:'Missing token'}); // Unauthorized
  }

  userModel.removeToken(token, (err) => {
    if (err) return res.status(500).json({error_message:'server error'});
    return res.status(200).json({error_message:'Logged out successfully'});
  });
};
const getUserDetails = (req, res) => {
  const userId = parseInt(req.params.userId, 10); 
  userModel.getUserById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error_message: 'Internal server error' }); // Server Error
    }
    if (!user) {
      return res.status(404).json({ error_message: 'User not found' }); // Not Found
    }
    return res.status(200).json({ user });
  });
};
const getAllUsers = (req, res) => {
  userModel.getAllUsers((err, users) => {
    if (err) {
      return res.status(500).json({ error_message: 'Internal server error' }); // Server Error
    }
    return res.status(200).json({ users });
  });
};


module.exports ={
  create_account,
  login,
  logout,
  getAllUsers,
  getUserDetails
};

