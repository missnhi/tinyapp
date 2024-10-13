// helpers.js
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "nhi.phan.ley@gmail.com",
    password: "1234",
  }
};

// Function to generate a random string for the shortURL: ex: b2xVn2
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// Helper function to get user object by user_id cookie
function getUserById(req) {
  const userId = req.session.user_id;
  return users[userId];
}

//filer the URLs by user_id
function urlsForUser(id, urlDatabase) {
  const urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

module.exports = {users, generateRandomString, getUserById, urlsForUser};