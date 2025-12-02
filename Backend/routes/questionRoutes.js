const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// Question routes
router.get('/item/:itemId/question', questionController.listQuestions);
router.post('/item/:itemId/question', questionController.addQuestion);
router.post('/question/:questionId', questionController.answerQuestion);

module.exports = router;