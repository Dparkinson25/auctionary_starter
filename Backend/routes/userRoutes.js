const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
router.post('/users', userController.addUser);
router.post('/login', userController.loginUser);
router.post('/logout', (req, res) => {
  res.status(501).json({ message: 'logout not implemented' });
});
router.get('/users/:userId', userController.getUserDetails);

module.exports = router;