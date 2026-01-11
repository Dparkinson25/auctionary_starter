// Question Controller
const e = require('express');
const QuestionModel = require('../models/question.server.models');

// Placeholder for adding a question
const addQuestion = (req, res) => {
  const itemId = req.params.itemId;
  const userId = req.user.id; 
  const { question_text, ...extraFields } = req.body;
  
  if(!req.body || Object.keys(req.body).length === 0) {
    return  res.status(400).json({ error_message: 'question is missing' });
  }
  if (Object.keys(extraFields).length > 0) {
    return res.status(400).json({error_message : "extra fields detected in request body."}); // Bad Request
  } 

  if (!question_text || question_text.trim() === '') {
    return res.status(400).json({ error_message: 'Question text is required' });
  }

  QuestionModel.addQuestionToItem(itemId, userId, question_text, (err,id) => {
   
    if (err) {
      if (err.message === 'Item not found') {
        return res.status(404).json({ error_message: 'Item not found' });
      }
      if (err.message === 'Unauthorized') {
        return res.status(403).json({ error_message: 'Unauthorized to ask question on own item' });
      }
      if (err.message === 'User not found') {
        return res.status(404).json({ error_message: 'User not found' });
      }
      return res.status(500).json({ error_message: 'Failed to add question' });
    }
    return res.status(201).json({ question_id: questionId });
  });
};

// Placeholder for answering a question
const answerQuestion = (req, res) => {
  const questionId = parseInt(req.params.questionId, 10); 
  const { answer_text, ...extraFields } = req.body;

  if (!answer_text || answer_text.trim() === '') {
    return res.status(400).json({ error_message: 'Answer text is required' });
  }
  if (Object.keys(extraFields).length > 0) {
    return res.status(400).json({error_message : "extra fields detected in request body."}); // Bad Request
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    return  res.status(400).json({ error_message: 'answer is missing' });
  }
  QuestionModel.answerQuestionById(questionId, answer_text, (err) => {
    if (err) {
      if (err.message === 'Unauthorized') {
        return res.status(403).json({ error_message: 'Unauthorized to answer this question as user is not the owner' });
      }
      if (err.message === 'Question not found') {
        return res.status(404).json({ error_message: 'Question not found' });
      }
      return res.status(500).json({ error_message: 'Failed to answer question' });
    } 
    return res.status(200).json({ error_message: 'Question answered correctly' });
  });
  
};

// Placeholder for listing questions
const listQuestions = (req, res) => {
  const itemId = req.params.itemId;
  QuestionModel.getQuestionsForItem(itemId, (err, questions) => {
    if (err) {
      if (err.message === 'Item not found') {
        return res.status(404).json({ error_message: 'Item not found' });
      }
      return res.status(500).json({ error_message: 'Failed to get questions' });
    }
    return res.status(200).json(questions);
  });

};

module.exports = {
  addQuestion,
  answerQuestion,
  listQuestions
};
