const asyncHandler = require('express-async-handler');
const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  const senderId = req.user._id;

  if (!content || !chatId) {
    return res
      .status(400)
      .json({ message: 'Message content and chatId are required' });
  }

  const chat = await Chat.findById(chatId).populate(
    'users',
    '_id blockedUsers'
  );

  if (!chat) return res.status(400).json({ message: 'Chat not found' });

  const recipient = chat.users.find(
    (u) => u._id.toString() !== senderId.toString()
  );
  const sender = chat.users.find(
    (u) => u._id.toString() === senderId.toString()
  );

  if (sender.blockedUsers.includes(recipient._id)) {
    return res.status(403).json({ message: 'You have blocked this user' });
  }

  if (recipient.blockedUsers.includes(sender._id)) {
    return res.status(403).json({ message: 'You are blocked by this user' });
  }

  const newMessage = {
    sender: senderId,
    content,
    chat: chatId,
  };

  let message = await Message.create(newMessage);

  message = await message.populate('sender', 'username profilePic');
  message = await message.populate('chat');
  message = await User.populate(message, {
    path: 'chat.users',
    select: 'username email profilePic',
  });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

  res.status(201).json(message);
});

const allMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    return res.status(400).json({ message: 'Chat ID is required' });
  }

  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'username profilePic email')
    .populate('chat');

  res.status(200).json(messages);
});

module.exports = { sendMessage, allMessage };
