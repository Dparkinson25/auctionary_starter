<<<<<<< HEAD
const db = require('../lib/database');// Question Model

const mongoose = require('mongoose');
const { get } = require('../routes/event.server.routes');

const questionModel = new mongoose.Schema({
 getQuestionsForItem: function(itemId, callback) {
    const sql = 'SELECT * FROM questions WHERE item_id = ?';
    db.all(sql, [itemId], (err, rows) => {
      if (err) return callback(err);
      return callback(null, rows);
    });
},

 addQuestionToItem: function(itemId, userId, questionText, callback) {
    const sql = 'INSERT INTO questions (item_id, user_id, question_text) VALUES (?, ?, ?)';
    db.run(sql, [itemId, userId, questionText], function(err) {
      if (err) return callback(err);
      return callback(null, this.lastID);
    });
},

  answerQuestionById: function(questionId, answerText, callback) {
    const sql = 'UPDATE questions SET answer_text = ? WHERE question_id = ?';
    db.run(sql, [answerText, questionId], function(err) {
      if (err) return callback(err);
      return callback(null);
    });
  }
});


module.exports = mongoose.model('Question', questionModel);
=======
// Question Model

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  askerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionText: { type: String, required: true },
  answers: [
    {
      responderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Question', questionSchema);
>>>>>>> c65732f4fdcdf6fa4d735dacf89c8ba1d10b8c50
