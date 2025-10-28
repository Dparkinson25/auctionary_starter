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
  module.exports = router;
}

