const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.server.controllers');

// Question routes
module.exports = function(app) {
    app.route('/item/:itemId/question')
         .get(questionController.listQuestions)
         .post(questionController.addQuestion);
    app.route('/question/:questionId')
         .post(questionController.answerQuestion);
    module.exports = router;
}


