const express = require('express');
const router = express.Router();
const coreController = require('../controllers/core.server.controllers');
const { authenticateUser } = require('../lib/authentication');

router.post('/item/:itemId/bid', authenticateUser, coreController.addBid);
router.get('/item/:itemId/bid', coreController.getBidHistory);
router.post('/items/search', coreController.searchItems);
router.get('/search', coreController.searchItems);
router.get('/item/:itemId', coreController.getItemDetails);

module.exports = router;
