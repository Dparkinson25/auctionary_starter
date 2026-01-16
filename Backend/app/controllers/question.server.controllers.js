
const e = require('express');
const QuestionModel = require('../models/question.server.models');
const db = require('../../database');
const { clean, containsProfanity } = require('../lib/profanity');


const addQuestion = (req, res) => {
  const itemId = req.params.itemId;
  const userId = req.user.id; 
  const { question_text, ...extraFields } = req.body;
  
  if(!req.body || Object.keys(req.body).length === 0) {
    return  res.status(400).json({ error_message: 'question is missing' });
  }
  if (Object.keys(extraFields).length > 0) {
    return res.status(400).json({error_message : "extra fields detected in request body."}); 
  } 

  if (!question_text || question_text.trim() === '') {
    return res.status(400).json({ error_message: 'Question text is required' });
  }

  // check question text
  const safeQuestion = clean(question_text);
  if (containsProfanity(question_text)) {
    console.log('Profanity detected in question; sanitized for user:', userId);
  }

  QuestionModel.addQuestionToItem(itemId, userId, safeQuestion, (err,id) => {
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
    return res.status(200).json({ question_id: id });
  });
};


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
  const userId = req.user && req.user.id;
  // check answer text
  const safeAnswer = clean(answer_text);
  if (containsProfanity(answer_text)) {
    console.log('Profanity detected in answer; sanitized for user:', userId);
  }
  QuestionModel.answerQuestionById(questionId, safeAnswer, userId, (err) => {
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


const listQuestions = (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (Number.isNaN(itemId)) return res.status(404).json({ error_message: 'Item not found' });

  db.get('SELECT item_id FROM items WHERE item_id = ?', [itemId], (err, row) => {
    if (err) return res.status(500).json({ error_message: 'Failed to get questions' });
    if (!row) return res.status(404).json({ error_message: 'Item not found' });

    QuestionModel.getQuestionsForItem(itemId, (err, questions) => {
      if (err) return res.status(500).json({ error_message: 'Failed to get questions' });
      return res.status(200).json(questions || []);
    });
  });

};

module.exports = {
  addQuestion,
  answerQuestion,
  listQuestions
};
