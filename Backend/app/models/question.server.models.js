const db = require('../../database');// Question Model



const questionModel = ({
 getQuestionsForItem: function(itemId, callback) {
    const sql = 'SELECT question_id, question AS question_text, answer AS answer_text, asked_by, item_id FROM questions WHERE item_id = ? ORDER BY question_id DESC';
    db.all(sql, [itemId], (err, rows) => {
      if (err) return callback(err);
      return callback(null, rows || []);
    });
  },

 addQuestionToItem: function(itemId, userId, questionText, callback) {
    // Verify item exists and user is not the creator
    db.get('SELECT creator_id FROM items WHERE item_id = ?', [itemId], (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(new Error('Item not found'));
      if (row.creator_id === userId) return callback(new Error('Unauthorized'));
      const sql = 'INSERT INTO questions (question, asked_by, item_id) VALUES (?, ?, ?)';
      db.run(sql, [questionText, userId, itemId], function(err) {
        if (err) return callback(err);
        return callback(null, this.lastID);
      });
    });
  },

  answerQuestionById: function(questionId, answerText, userId, callback) {
    // Verify question exists and requester is the item owner
    const sqlCheck = `SELECT q.question_id, q.item_id, i.creator_id FROM questions q JOIN items i ON q.item_id = i.item_id WHERE q.question_id = ?`;
    db.get(sqlCheck, [questionId], (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(new Error('Question not found'));
      if (row.creator_id !== userId) return callback(new Error('Unauthorized'));
      const sql = 'UPDATE questions SET answer = ? WHERE question_id = ?';
      db.run(sql, [answerText, questionId], function(err) {
        if (err) return callback(err);
        if (this.changes === 0) return callback(new Error('Question not found'));
        return callback(null);
      });
    });
  }
});


module.exports =questionModel;
