const db = require('../lib/database');// Question Model



const questionModel = ({
 getQuestionsForItem: function(itemId, callback) {
    const sql = 'SELECT question_id, question_text, answer_text, asked_by, item_id FROM questions WHERE item_id = ? ORDER BY question_id DESC';
    db.all(sql, [itemId], (err, rows) => {
      if (err) return callback(err);
      return callback(null, rows || []);
    });
  },

 addQuestionToItem: function(itemId, userId, questionText, callback) {
    const sql = 'INSERT INTO questions (question_text, asked_by, item_id) VALUES (?, ?, ?)';
    db.run(sql, [questionText, userId, itemId], function(err) {
      if (err) return callback(err);
      return callback(null, this.lastID);
    });
  },

  answerQuestionById: function(questionId, answerText, callback) {
    const sql = 'UPDATE questions SET answer_text = ? WHERE question_id = ?';
    db.run(sql, [answerText, questionId], function(err) {
      if (err) return callback(err);
      if (this.changes === 0) return callback(new Error('Question not found'));
      return callback(null);
    });
  }
});


module.exports =questionModel;
