const jwt = require('jsonwebtoken');

const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

module.exports = generateToken;
