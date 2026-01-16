// Bid Model

const db = require('../../database');

const coreModel = {
    addBidToItem: function(itemId, userId, bidAmount, callback) {
        const timestamp = Date.now();
        const sql = 'INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?, ?, ?, ?)';
        db.run(sql, [itemId, userId, bidAmount, timestamp], function(err) {
            if (err) return callback(err);
            return callback(null, this.lastID);
        });
    },

    getBidsForItem: function(itemId, callback) {
        const sql = 'SELECT b.item_id, b.amount, b.timestamp, b.user_id, u.first_name, u.last_name FROM bids b JOIN users u ON b.user_id = u.user_id WHERE b.item_id = ? ORDER BY b.amount DESC';
        db.all(sql, [itemId], (err, rows) => {
            if (err) return callback(err);
            return callback(null, rows);
        });
    },

    searchBids: function(minAmount, maxAmount, callback) {
        const sql = 'SELECT * FROM bids WHERE amount BETWEEN ? AND ?';
        db.all(sql, [minAmount, maxAmount], (err, rows) => {
            if (err) return callback(err);
            return callback(null, rows);
        });
    },

    addItem: function(item, userId, callback) {
        const sql = 'INSERT INTO items (name, description, starting_bid, start_date, end_date, creator_id) VALUES (?, ?, ?, ?, ?, ?)';
        db.run(sql, [item.name, item.description, item.starting_bid, item.start_date, item.end_date, userId], function(err) {
            if (err) return callback(err);
            return callback(null, this.lastID);
        });
    }
};

module.exports = coreModel;
exports.getCoredata = () => {
  return {data: 'Core data'};
}