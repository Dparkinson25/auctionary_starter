const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.server.controllers');
const { authenticateUser } = require('../lib/authentication');


router.post('/users', userController.create_account); 
router.post('/login', userController.login); 
router.post('/logout', authenticateUser, userController.logout); 

router.get('/users/:userId', userController.getUserDetails);
router.get('/users', userController.getAllUsers); 

module.exports = router;




