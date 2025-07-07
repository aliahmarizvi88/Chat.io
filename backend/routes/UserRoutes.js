const express = require('express');
const {
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
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/uploadMiddleware');

const route = express.Router();

route.post('/register', registerUser);
route.post('/login', authUser);
route.get('/', protect, allUser);
route.put('/upload-photo', protect, upload.single('image'), uploadProfilePic);
route.delete('/deleteUser', protect, deleteUser);
route.put('/update', protect, updateUser);
route.post('/logout', logoutUser);

route.post('/verify-otp', verifyOtp);
route.put('/block', protect, blockUser);
route.put('/unblock', protect, unblockUser);

module.exports = route;
