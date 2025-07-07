const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { Server } = require('socket.io');
const path = require('path');

const { connectDB } = require('./config/connection');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/user');

const app = express();
const server = http.createServer(app);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const userRoutes = require('./routes/UserRoutes');
const chatRoutes = require('./routes/ChatRoutes');
const messageRoutes = require('./routes/MessageRoutes');

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Chat is Running');
});

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/message', messageRoutes);

app.use(notFound);
app.use(errorHandler);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io = new Server(server, {
  pingTimeout: 6000,
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('setup', async (userData) => {
    try {
      socket.join(userData._id);
      console.log(`User ${userData._id} connected`);
      await User.findByIdAndUpdate(userData._id, { isOnline: true });
      socket.userId = userData._id;
      socket.emit('Connected');
    } catch (err) {
      console.error('Setup Error:', err.message);
    }
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessage) => {
    const chat = newMessage.chat;
    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (String(user._id) === String(newMessage.sender._id)) return;
      console.log(`sending to user: ${user._id}`);
      socket.in(user._id).emit('message received', newMessage);
    });
  });

  socket.on('disconnect', async () => {
    try {
      console.log(`Client ${socket.userId} disconnected`);
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false });
      }
    } catch (err) {
      console.error('Disconnect Error:', err.message);
    }
  });
});
