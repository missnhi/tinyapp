const {assert} = require('chai');
const {getUserById} = require('../helpers');

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