const Authentication = function(req, res, next){
    let token = req.get('X-Authorization');

    users.getIdFromToken(token, (err, userId) => {
        const sql = 'SELECT user_id FROM users WHERE session_token = ?';
        const params = [token];
        if (err === null) {
            return res.sendStatus(401);
        }
        if (userId === null) {
            return res.sendStatus(401);
        }
        next();
    });
};