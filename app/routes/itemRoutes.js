const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Item routes
router.get('/search', (req, res) => {
  res.status(501).json({ message: 'search not implemented' });
});
router.post('/item', itemController.addItem);
router.get('/item/:itemId', itemController.getItemDetails);

module.exports = router;