const asyncHandler = require('express-async-handler');
const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId is required' });
  }

  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  })
    .populate('users', '-password')
    .populate('latestMessage');

  if (chat) return res.status(200).json(chat);

  const newChat = await Chat.create({
    chatName: 'sender',
    isGroupChat: false,
    users: [req.user._id, userId],
  });

  const fullChat = await Chat.findById(newChat._id).populate(
    'users',
    '-password'
  );

  res.status(201).json(fullChat);
});

const fetchChat = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ users: { $in: [req.user._id] } })
    .populate('users', '-password')
    .populate('groupAdmin', '-password')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });

  res.status(200).json(chats);
});

const createGroupChat = asyncHandler(async (req, res) => {
  let { name, users } = req.body;

  if (!name || !users) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    users = JSON.parse(users);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid users format' });
  }

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: 'At least 2 users are required for a group chat' });
  }

  users.push(req.user._id);

  const groupChat = await Chat.create({
    chatName: name,
    isGroupChat: true,
    users,
    groupAdmin: req.user._id,
  });

  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  res.status(201).json(fullGroupChat);
});

//In chat option
const clearChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chatId) return res.status(404).json({ message: 'Chat not Found' });

  chat.clearedAt.set(userId.toString(), new Date());
  await chat.save();

  res.status(200).json({ message: 'Chat Cleared Sucessfully!' });
});

module.exports = { accessChat, fetchChat, createGroupChat, clearChat };
