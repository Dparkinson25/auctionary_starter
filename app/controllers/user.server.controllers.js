// User Controller

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

users.authenticateUser(req.body.email, req.body.password, (err, userId) => {
  if (err) return res.Status(400)
  users.getToken(userId, (err, token) => {
    if(token){
      return res.status(200).send({user_id: id, session_token: token})
    } else {
      users.setToken(id,(err, token) => {
        if(err) return res.sendStatus(500)
        return res.status(200).send({user_id: id, session_token: token})
      })
    }
  })
});
// Placeholder for logging in a user
const login = (req, res) => {
  res.sendStatus(500);
};

// Placeholder for getting user details
const logout = (req, res) => {
  res.sendStatus(500)
};

module.exports ={
  create_account:create_account,
  login:login,
  logout:logout
}