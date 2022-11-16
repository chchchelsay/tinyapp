
//******RANDOM ID FOR SHORT URLS ******//
const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//****finding a user in user object from their email****/
const getUserByEmail = function(userEmail, users) {
  for (let i of Object.keys(users)) {
    if (users[i].email === userEmail) {
      return users[i];
    }  
  }
  return null;
};

//URLS FOR USER - returns urls where userID = id of logged in user
const urlsForUser = (id, urlDatabase) => {
  const userURL = {};
  
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === id) {
        userURL[shortURL] = urlDatabase[shortURL];
      }
    }
    return userURL;
  };
  
  module.exports = {
    generateRandomString,
    getUserByEmail,
    urlsForUser
  };
