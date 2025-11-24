const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');

// Bid routes
router.post('/item/:itemId/bid', bidController.addBid);
router.get('/item/:itemId/bid', bidController.getBidHistory);

module.exports = router;