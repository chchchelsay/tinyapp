const { assert } = require('chai');
const { getUserByEmail, generateRandomString, urlsForUser} = require('../helpers.js');

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

const testURLs = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID2",
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if the email is not found in the database', function() {
    const user = getUserByEmail("nobody@example.com", testUsers);
    const expectedUser = undefined;

    assert.equal(user, expectedUser);
  });
});

describe('generateRandomString', function() {
  it('should return a string with 6 characters', function() {
    const expected = "hfgstRTj";
    const actual = generateRandomString(6);

    assert.equal(actual.length, expected.length);
  });
});

describe('urlsForUser', function() {
  it('should return an object with all urls for a given user ID', function() {
    const expected = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID",
      },
    };

    const actual = urlsForUser('userRandomID', testURLs);

    assert.deepEqual(expected, actual);
  });
});
