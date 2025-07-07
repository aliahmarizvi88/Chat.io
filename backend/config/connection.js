const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('DB CONNECTED');
  } catch (error) {
    console.log('DB NOT CONNECTED: ', error);
  }
};

module.exports = { connectDB };
