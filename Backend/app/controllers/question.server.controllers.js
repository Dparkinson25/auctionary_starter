// Question Controller

// Placeholder for adding a question
const addQuestion = (req, res) => {
  const itemId = req.params.itemId;
};

// Placeholder for answering a question
const answerQuestion = (req, res) => {
  const questionId = req.params.questionId;
  
};

// Placeholder for listing questions
const listQuestions = (req, res) => {
  const itemId = req.params.itemId;

};

module.exports = {
  addQuestion: addQuestion,
  answerQuestion: answerQuestion,
  listQuestions: listQuestions
};