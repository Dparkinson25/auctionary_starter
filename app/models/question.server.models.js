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