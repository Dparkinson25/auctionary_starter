// Bid Model

const db = require('../lib/database');
const sqlite3 = require('sqlite3').verbose();
const { search } = require('../routes/event.server.routes');

const bidModel = ({ addBidToItem: function(itemId, userId, bidAmount, callback) {
    const sql = 'INSERT INTO bids (item_id, user_id, bid_amount) VALUES (?, ?, ?)';
    db.run(sql, [itemId, userId, bidAmount], function(err) { 
        if (err) return callback(err);
        return callback(null, this.lastID);
    });
},
    getBidsForItem: function(itemId, callback) {
    const sql = 'SELECT * FROM bids WHERE item_id = ? ORDER BY bid_amount DESC';
    db.all(sql, [itemId], (err, rows) => {
        if (err) return callback(err);
        return callback(null, rows);
    });
},
    searchBids: function(minAmount, maxAmount, callback) {
    const sql = 'SELECT * FROM bids WHERE bid_amount BETWEEN ? AND ?'; 
    db.all(sql, [minAmount, maxAmount], (err, rows) => {
        if (err) return callback(err);
        return callback(null, rows);
    });
}
});
module.exports = bidModel;
exports.getCoredata = () => {
  return {data: 'Core data'};
}