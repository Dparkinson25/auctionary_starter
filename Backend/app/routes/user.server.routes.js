const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.server.controllers');
const authenticateUser = require('../lib/authentication');

// User routes
router.post('/users', userController.create_account); // Create a new user
router.post('/login', userController.login); // User login
router.post('/logout', authenticateUser, userController.logout); // User logout
router.get('/users/:userId', authenticateUser, userController.getUserDetails); // Get user details (authenticated)
router.get('/users', userController.getAllUsers); // Get all users

module.exports = router;




