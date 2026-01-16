const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.server.controllers');
const { authenticateUser } = require('../lib/authentication');


router.get('/item/:itemId/question', questionController.listQuestions);
router.post('/item/:itemId/question', authenticateUser, questionController.addQuestion);
router.post('/question/:questionId', authenticateUser, questionController.answerQuestion);

module.exports = router;


