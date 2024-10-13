// middleware.js
const cookieSession = require('cookie-session');

const sessionMiddleware = cookieSession({
  name: 'session',
  keys: ['yourSecretKey1', 'yourSecretKey2'], // Replace with your own secret keys
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});

module.exports = {sessionMiddleware};