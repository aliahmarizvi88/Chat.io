const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, allMessage } = require('../controllers/messageController');

const route = express.Router();

route.post('/', protect, sendMessage);
route.get('/:chatId', protect, allMessage);

module.exports = route;
