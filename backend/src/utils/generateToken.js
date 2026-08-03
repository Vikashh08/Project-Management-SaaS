const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_fallback', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
