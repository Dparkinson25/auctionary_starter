// Bid Model

const mongoose = require('mongoose');
const { search } = require('../routes/event.server.routes');

const bidSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  searchIndex: { type: String },
});




module.exports = mongoose.model('Bid', bidSchema);