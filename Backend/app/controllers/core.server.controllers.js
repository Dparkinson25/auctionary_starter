const coreModel = require('../models/core.server.models');
const db = require('../../database');
const { clean, containsProfanity } = require('../lib/profanity');

const searchItems = (req, res) => {
  const q = req.query.q || null;
  const status = req.query.status || null;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = parseInt(req.query.offset, 10) || 0;
  const userToken = req.get('X-Authorization');
  const now = Date.now();

  const send400 = (msg) => res.status(400).json({ error_message: msg || 'Bad request' });

  
  const allowedStatus = [null, 'OPEN', 'BID', 'ARCHIVE'];
  if (!allowedStatus.includes(status)) return send400('status not recognised');

  const baseWhere = [];
  const params = [];

  if (q) {
    baseWhere.push('(i.name LIKE ? OR i.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  
  const execQuery = (whereClause, p, cb) => {
    const sql = `SELECT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name FROM items i JOIN users u ON i.creator_id = u.user_id ${whereClause} ORDER BY i.item_id ASC LIMIT ? OFFSET ?`;
    p.push(limit, offset);
    db.all(sql, p, (err, rows) => {
      if (err) return res.status(500).json({ error_message: 'Internal server error' });
      return res.status(200).json(rows || []);
    });
  };

  
  if (!status) {
    const where = baseWhere.length ? 'WHERE ' + baseWhere.join(' AND ') : '';
    return execQuery(where, params.slice());
  }

  // require authentication
  if (!userToken) return send400('status filter requires authentication');

  // Resolve token to user id
  userModel = require('../models/user.server.models');
  userModel.getUserIdFromToken(userToken, (err, userId) => {
    if (err) return res.status(500).json({ error_message: 'Internal server error' });
    if (!userId) return res.status(400).json({ error_message: 'Invalid token' });

    if (status === 'OPEN') {
      // Items created by the user and not yet ended
      const where = 'WHERE i.creator_id = ? AND i.end_date > ?' + (baseWhere.length ? ' AND ' + baseWhere.join(' AND ') : '');
      const p = [userId, now].concat(params);
      return execQuery(where, p);
    }

    if (status === 'ARCHIVE') {
      const where = 'WHERE i.creator_id = ? AND i.end_date <= ?' + (baseWhere.length ? ' AND ' + baseWhere.join(' AND ') : '');
      const p = [userId, now].concat(params);
      return execQuery(where, p);
    }

    if (status === 'BID') {
      // Items user has bid on
      const where = 'WHERE i.item_id IN (SELECT b.item_id FROM bids b WHERE b.user_id = ?)' + (baseWhere.length ? ' AND ' + baseWhere.join(' AND ') : '');
      const p = [userId].concat(params);
      return execQuery(where, p);
    }
    return send400('status not recognised');
  });
};

const addItem = (req, res) => {
  const { name, description, starting_bid, end_date, ...extraFields } = req.body;
  console.log('addItem called by user:', req.user && req.user.id, 'body:', req.body);
  if (Object.keys(extraFields).length > 0) {
    return res.status(400).json({error_message : "extra fields detected in request body."}); // Bad Request
  }
  if (!name) return res.status(400).json({ error_message: 'name has not had data entered.' });
  if (!description) return res.status(400).json({ error_message: 'description has not had data entered.' });
  if (starting_bid === undefined || starting_bid === null) return res.status(400).json({ error_message: 'starting_bid has not had data entered.' });
  if (!end_date) return res.status(400).json({ error_message: 'end_date has not had data entered.' });

  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ error_message: 'Unauthorized' });

  // Sanitize text fields to remove/replace profanity
  const safeName = clean(name || '');
  const safeDescription = clean(description || '');
  if (containsProfanity(name) || containsProfanity(description)) {
    console.log('Profanity detected in new item; sanitized before save for user:', req.user && req.user.id);
  }

  const newItem = { name: safeName, description: safeDescription, starting_bid: Number(starting_bid), start_date: Date.now(), end_date };

  
  const numericStarting = Number(starting_bid);
  if (!Number.isFinite(numericStarting) || numericStarting < 0) return res.status(400).json({ error_message: 'starting_bid must be a non-negative number' });

 
  const numericEnd = Number(end_date);
  const now = Date.now();
  if (!Number.isFinite(numericEnd) || numericEnd <= now) return res.status(400).json({ error_message: 'end_date must be a valid future timestamp' });

  if (coreModel && typeof coreModel.addItem === 'function') {
    coreModel.addItem(newItem, userId, (err, itemId) => {
      if (err) {
        console.error('Error adding new item:', err);
        return res.status(500).json({ error_message: 'Internal server error' });
      }
      return res.status(201).json({ item_id: itemId });
    });
    return;
  }

  return res.status(500).json({ error_message: 'Internal server error' });

}

const getItemDetails = (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (Number.isNaN(itemId)) return res.status(404).json({ error_message: 'Item not found' });

  db.get('SELECT item_id, name, description, starting_bid, start_date, end_date, creator_id FROM items WHERE item_id = ?', [itemId], (err, item) => {
    if (err) return res.status(500).json({ error_message: 'Internal server error' });
    if (!item) return res.status(404).json({ error_message: 'Item not found' });

    db.get('SELECT first_name, last_name FROM users WHERE user_id = ?', [item.creator_id], (err, creator) => {
      if (err) return res.status(500).json({ error_message: 'Internal server error' });

      // Find current highest bid
      db.get('SELECT user_id, amount, timestamp FROM bids WHERE item_id = ? ORDER BY amount DESC LIMIT 1', [itemId], (err, topBid) => {
        if (err) return res.status(500).json({ error_message: 'Internal server error' });

        const current_bid = topBid ? topBid.amount : item.starting_bid;

        if (topBid) {
          db.get('SELECT user_id, first_name, last_name FROM users WHERE user_id = ?', [topBid.user_id], (err, bidder) => {
            if (err) return res.status(500).json({ error_message: 'Internal server error' });
            const result = {
              item_id: item.item_id,
              creator_id: item.creator_id,
              name: item.name,
              description: item.description,
              starting_bid: item.starting_bid,
              start_date: item.start_date,
              end_date: item.end_date,
              first_name: creator ? creator.first_name : null,
              last_name: creator ? creator.last_name : null,
              current_bid: current_bid,
              current_bid_holder: bidder ? { user_id: bidder.user_id, first_name: bidder.first_name, last_name: bidder.last_name } : null
            };
            return res.status(200).json(result);
          });
        } else {
          const result = {
            item_id: item.item_id,
            creator_id: item.creator_id,
            name: item.name,
            description: item.description,
            starting_bid: item.starting_bid,
            start_date: item.start_date,
            end_date: item.end_date,
            first_name: creator ? creator.first_name : null,
            last_name: creator ? creator.last_name : null,
            current_bid: current_bid,
            current_bid_holder: null
          };
          return res.status(200).json(result);
        }
      });
    });
  });
};

const addBid = (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  const userId = req.user && req.user.id;

  if (Number.isNaN(itemId)) return res.status(404).json({ error_message: 'Item not found' });
  if (!userId) return res.status(401).json({ error_message: 'Unauthorized' });

  const { amount, ...extra } = req.body;
  if (Object.keys(extra).length > 0) return res.status(400).json({ error_message: 'extra fields detected in request body.' });
  if (amount === undefined || amount === null) return res.status(400).json({ error_message: 'amount has not had data entered.' });
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    console.log('addBid: invalid amount value ->', amount);
    return res.status(400).json({ error_message: 'invalid amount' });
  }

  // Check item exists and fetch starting_bid and creator
  db.get('SELECT item_id, starting_bid, creator_id FROM items WHERE item_id = ?', [itemId], (err, item) => {
    if (err) return res.status(500).json({ error_message: 'Internal server error' });
    if (!item) {
      console.log('addBid: item not found ->', itemId);
      return res.status(404).json({ error_message: 'Item not found' });
    }
    if (item.creator_id === userId) return res.status(403).json({ error_message: 'Cannot bid on own item' });

      // get current highest bid
      db.get('SELECT MAX(amount) as current_bid FROM bids WHERE item_id = ?', [itemId], (err, row) => {
        if (err) return res.status(500).json({ error_message: 'Internal server error' });
        const current = (row && row.current_bid !== null && row.current_bid !== undefined) ? Number(row.current_bid) : Number(item.starting_bid);
        if (numericAmount <= current) {
          console.log('addBid: amount too low', { itemId, numericAmount, current });
          return res.status(400).json({ error_message: 'amount less or equal than current bid' });
        }

        // use core model to insert bid
        if (coreModel && typeof coreModel.addBidToItem === 'function') {
          coreModel.addBidToItem(itemId, userId, numericAmount, (err, bidId) => {
            if (err) return res.status(500).json({ error_message: 'Internal server error' });
            console.log('addBid: bid inserted', { itemId, bidId, userId, numericAmount });
            return res.status(201).json({ bid_id: bidId });
          });
          return;
        }

        const timestamp = Date.now();
        db.run('INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?, ?, ?, ?)', [itemId, userId, numericAmount, timestamp], function(err) {
          if (err) return res.status(500).json({ error_message: 'Internal server error' });
          return res.status(201).json({ bid_id: this.lastID });
        });
      });
  });
};

const getBidHistory = (req, res) => {
  const itemId = parseInt(req.params.itemId, 10);
  if (Number.isNaN(itemId)) return res.status(404).json({ error_message: 'Item not found' });

  db.get('SELECT item_id FROM items WHERE item_id = ?', [itemId], (err, itemRow) => {
    if (err) return res.status(500).json({ error_message: 'Internal server error' });
    if (!itemRow) return res.status(404).json({ error_message: 'Item not found' });

    const sql = `SELECT b.item_id, b.amount, b.timestamp, b.user_id, u.first_name, u.last_name FROM bids b JOIN users u ON b.user_id = u.user_id WHERE b.item_id = ? ORDER BY b.amount DESC`;
    db.all(sql, [itemId], (err, rows) => {
      if (err) return res.status(500).json({ error_message: 'Internal server error' });
      return res.status(200).json(rows || []);
    });
  });
};

module.exports = {
  searchItems: searchItems,
  addItem: addItem,
  getItemDetails: getItemDetails,
  addBid: addBid,
  getBidHistory: getBidHistory
};
exports.getCoreDetails = (req, res) => {
  res.status(200).json({ message: "Core controller is working" });
};

