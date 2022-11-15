const { assert } = require('chai');
const { getUserByEmail, urlsForUser} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return null if email is empty', function() {
    const user = getUserByEmail("", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });

  it('should return null if email is invalid', function() {
    const user = getUserByEmail("chels@example.com", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });  
});

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID2",
  },
};
describe('urlsForUser', function() {
  it('should return an object with all urls for a given user ID', function() {
    const expected = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID",
      },
    };

    const actual = urlsForUser('userRandomID', urlDatabase);

    assert.deepEqual(expected, actual);
  });
});
