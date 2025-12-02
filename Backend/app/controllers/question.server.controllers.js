// Question Controller
const QuestionModel = require('../models/question.server.models');

// Placeholder for adding a question
const addQuestion = (req, res) => {
  const itemId = req.params.itemId;
  const userId = req.user.id; 
  const { question_text } = req.body;

  if (!question_text) {
    return res.status(400).send({ error: 'Question text is required' });
  }
  QuestionModel.addQuestionToItem(itemId, userId, question_text, (err, questionId) => {
    if (err) {
      return res.status(500).send({ error: 'Failed to add question' });
    }
    return res.status(201).send({ question_id: questionId });
  });
};

// Placeholder for answering a question
const answerQuestion = (req, res) => {
  const questionId = req.params.questionId;
  const sellerId = req.userId; 
  const { answer_text } = req.body;

  if (!answer_text) {
    return res.status(400).send({ error: 'Answer text is required' });
  }

  QuestionModel.answerQuestionById(questionId, answer_text, (err) => {
    if (err) {
      if (err.message === 'Unauthorized') {
        return res.status(403).send({ error: 'Unauthorized to answer this question' });
      }
      return res.status(500).send({ error: 'Failed to answer question' });
    } 
    return res.status(200).send({ message: 'Question answered correctly' });
  });
};

// Placeholder for listing questions
const listQuestions = (req, res) => {
  const itemId = req.params.itemId;
  QuestionModel.getQuestionsForItem(itemId, (err, questions) => {
    if (err) {
      return res.status(500).send({ error: 'Failed to retrieve questions' });
    }
    return res.status(200).send({ questions: questions });
  })
};

module.exports = {
  addQuestion: addQuestion,
  answerQuestion: answerQuestion,
  listQuestions: listQuestions
};