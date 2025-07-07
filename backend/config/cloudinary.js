const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.cloudCLOUDINARY_CLOUD_NAME,
  api_key: process.env.cloudCLOUDINARY_API_KEY,
  api_secret: process.env.cloudCLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
