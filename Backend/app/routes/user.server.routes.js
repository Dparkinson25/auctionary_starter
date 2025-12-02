import('../lib/authentication');

const express = require('express');
const router = express.Router();
const user = require('../controllers/user.server.controllers');


// User routes
module.exports = function(app) {
  app.route("/users")
     .post(user.create_account);
  app.route("/login")
     .post(user.login);
  app.route("/logout")
     .post(user.logout);
  app.route("/users/:userId")
      .get(user.getUserDetails);
  module.exports = router;
}

const authenticateUser = require('../lib/authentication');

router.get('protected/userinfo', authenticateUser, (req, res) => {
    return res.status(200).json({ user_id: req.user._id, email: req.user.email });
});
