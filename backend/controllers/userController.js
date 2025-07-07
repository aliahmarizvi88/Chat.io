const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const Chat = require('../models/chat');
const Message = require('../models/message');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: 'User already exists' });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const newUser = await User.create({
    username,
    email,
    password,
    verified: false,
    otp,
  });

  await sendEmail({
    to: email,
    subject: 'Your Chat.io OTP Code',
    text: `Your OTP code is: ${otp}`,
  });

  res.status(201).json({
    message: 'User created. OTP sent to email.',
    email: newUser.email,
    userId: newUser._id,
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp)
    return res.status(400).json({ message: 'Invalid OTP' });

  user.isVerified = true;
  user.otp = null;
  await user.save();

  const token = generateToken(user._id, user.username);

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: 'OTP verified. User logged in.',
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      verified: user.isVerified,
      createdAt: user.createdAt,
    },
  });
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.verifyPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  if (!user.isVerified)
    return res
      .status(403)
      .json({ message: 'Please verify your email via OTP first' });

  const token = generateToken(user._id, user.username);

  res
    .cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    })
    .json({
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
        blockedUsers: user.blockedUsers || [],
      },
    });
});

const uploadProfilePic = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.profilePic = `uploads/${req.file.filename}`;
  await user.save();

  res.status(200).json({
    message: 'Profile picture uploaded',
    profilePic: user.profilePic,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { username, email, password } = req.body;

  if (username) user.username = username;
  if (email) user.email = email;
  if (password) user.password = password;

  const updatedUser = await user.save();

  res.status(200).json({
    message: 'Profile updated successfully',
    user: {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      createdAt: updatedUser.createdAt,
    },
  });
});

const allUser = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

// // 7. DELETE USER & RELATED DATA
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await Message.deleteMany({ sender: userId });

  const chats = await Chat.find({ users: userId });
  for (const chat of chats) {
    chat.users = chat.users.filter((id) => id.toString() !== userId.toString());
    chat.users.length === 0
      ? await Chat.findByIdAndDelete(chat._id)
      : await chat.save();
  }

  await User.findByIdAndDelete(userId);
  res.clearCookie('token');

  res
    .status(200)
    .json({ message: 'User and related data deleted successfully' });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

//Blocking a user:
const blockUser = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  const { userId } = req.body;

  if (!userId)
    return res.status(400).json({ message: 'Target user ID required' });

  if (!currentUser.blockedUsers.includes(userId)) {
    currentUser.blockedUsers.push(userId);
    await currentUser.save();
  }

  res
    .status(200)
    .json({ message: 'User Blocked', blockedUsers: currentUser.blockedUsers });
});

const unblockUser = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  const { userId } = req.body;

  if (!userId)
    return res.status(400).json({ message: 'Target user ID required' });

  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (id) => id.toString() !== userId.toString()
  );
  await currentUser.save();

  res.status(200).json({
    message: 'User unblocked',
    blockedUsers: currentUser.blockedUsers,
  });
});

module.exports = {
  registerUser,
  verifyOtp,
  authUser,
  allUser,
  logoutUser,
  uploadProfilePic,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
};
