const {assert} = require('chai');
const {getUserById, urlsForUser} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "user1",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "userRandomID": {
    id: "userRandomID",
    email: "nhi.phan.ley@gmail.com",
    password: "1234",
  }
};

describe('getUserById', function() {
  it('should return a user with a valid user_id', function() {
    const req = {session: {user_id: "userRandomID"}};
    const user = getUserById(req, testUsers);
    const expectedUser = testUsers["userRandomID"];
    assert.isObject(user, 'user is an object');
    assert.deepEqual(user, expectedUser, 'user object matches');
  });
  
  it('should return undefined with an invalid user_id', function() {
    const req = {session: {user_id: "nonexistentID"}};
    const user = getUserById(req, testUsers);
    assert.isUndefined(user, 'user is undefined');
  });
});

const testUrlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
};

describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    const userUrls = urlsForUser("userRandomID", testUrlDatabase);
    const expectedUrls = {
      "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"}
    };
    assert.deepEqual(userUrls, expectedUrls, 'returns urls for the specified user');
  });
  
  it('should return an empty object if the urlDatabase does not contain any urls that belong to the specified user', function() {
    const userUrls = urlsForUser("nonexistentUserID", testUrlDatabase);
    assert.deepEqual(userUrls, {}, 'returns an empty object for a user with no urls');
  });
  
  it('should return an empty object if the urlDatabase is empty', function() {
    const userUrls = urlsForUser("userRandomID", {});
    assert.deepEqual(userUrls, {}, 'returns an empty object when urlDatabase is empty');
  });
  
  it('should not return any urls that do not belong to the specified user', function() {
    const userUrls = urlsForUser("userRandomID", testUrlDatabase);
    assert.notProperty(userUrls, "9sm5xK", 'does not return urls that do not belong to the specified user');
  });
});