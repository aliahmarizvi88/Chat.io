const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  accessChat,
  fetchChat,
  createGroupChat,
  clearChat,
} = require('../controllers/chatController');

const route = express.Router();

route.post('/', protect, accessChat);
route.get('/', protect, fetchChat);
route.get('/group', protect, createGroupChat);
route.put('/clear/:chatId', protect, clearChat);

module.exports = route;
