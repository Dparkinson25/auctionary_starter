const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.server.controllers');

//Auction event routes
router.post('/item/:itemId/bid', eventController.addBid);
router.get('/item/:itemId/bid', eventController.getBidHistory);
router.post('/items/search', eventController.searchItems);
router.post('/item', eventController.addItem);
router.get('/item/:itemId', eventController.getItemDetails);
module.exports = router;