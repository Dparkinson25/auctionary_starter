

const express = require('express');
const router = express.Router();
const questionController = require('/Backend/app/controllers/question.server.controllers');
authenticateUser = require('../lib/authentication');

// Question routes
module.exports = function(app) {
    app.route('/item/:item_id/question')
         .get(questionController.listQuestions)
         .post(authenticateUser,questionController.addQuestion);
    app.route('/question/:question_id')
         .post(authenticateUser,questionController.answerQuestion);
    module.exports = router;
}


