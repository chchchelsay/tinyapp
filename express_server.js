//******SETUP******//
const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");

const app = express();
app.use(cookieParser());

const PORT = 8080; //default port
app.set("view engine", "ejs");

//******CONVERTS POST REQUEST INTO READABLE STRING******//
app.use(express.urlencoded({ extended: true }));


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
const findUserByEmail = function(userEmail, users) {
  for (let i of Object.keys(users)) {
    if (users[i].email === userEmail) {
      return users[i];
    }  
  }
  return null;
};


//******DATABASE OBJECT******//
const urlDatabase = {
  "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "userRandomID",
    },
  "9sm5xK": {
      longURL: "https://www.google.com",
      userID: "user2RandomID"
    }
};

//URLS FOR USER - returns urls where userID = id of logged in user
const urlsForUser = (id, urlDatabase) => {
const userURL = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURL[shortURL] = urlDatabase[shortURL];
    }
  return userURL;
  }
};


//******USERS OBJECT******//
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//*****GET REQUESTS****************************//

//******homepage******//
app.get("/", (req, res) => {
  const userID = req.cookies["user_id"];

  if (userID) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});



//******JSON******//
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});




//******/urls shows list of saved shortened URLS******//
app.get("/urls", (req, res) => {
const userID = req.cookies["user_id"];
console.log(userID);
if (!userID) {
  res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
}

const templateVars = {
  urls: urlsForUser(userID, urlDatabase),
  user: users[userID]
};
  res.render('urls_index', templateVars);
});




//******/urls/new shows form to shorten and submit a new URL******//
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  
  //cannot create a new one if not logged in
  if (!userID) {
    res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
  
  }
    const templateVars = {
      user: users[userID]
    };

    res.render("urls_new", templateVars);
});




//******/u/:id redirects short URL to its represented long url address******//
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.cookies["user_id"];
  
  if (!userID) {
    res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
  }
  if (!urlDatabase[shortURL]) {
    res.status(403).send ('Error! Tiny URL does not exist...yet.');
    }   
  res.redirect(longURL);
});





//******/urls:id shows the longURL, short version, allows you to update short version******//
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  
  //if not logged in
  if (!userID) {
    res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
  }
  //if tiny saved url doesn't exist
  if (!urlDatabase[req.params.id]) {
    res.status(403).send ('Error! Tiny URL does not exist...yet.');
  }   
//cannot access if it's not your saved URL
  if (urlDatabase[req.params.id].userID !== userID) {
    res.status(401).send(`Error! Cannot access ${req.params.id}`);
  }

  const templateVars = {
    id: req.params.id,
    user: users[req.cookies["user_id"]],
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render('urls_show', templateVars);
});




//*******/register prompts user to sign up with an email and password*/
app.get("/register", (req, res) => {
const userID = req.cookies["user_id"];

if (userID) {
  res.redirect('/urls');
}
  const templateVars = {
  user: users[userID]
  };
  res.render('urls_register', templateVars);
});




app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];

  if (userID) {
    res.redirect('/urls');
  }

  const templateVars = {
    user: users[userID]
  };
  res.render("urls_login", templateVars)
});




//*****POST REQUESTS****************************//

//******/CREATES SHORT URL FOR A LONG ONE, REDIRECTS******//
app.post("/urls", (req, res) => {
  
  if (!req.cookies["user_id"]) {
    return res.status(401).send ('401 Error! You must be logged in to proceed.');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: (req.body.longURL),
    userID: req.cookies["user_id"]
  };
  res.redirect(`/urls/${shortURL}`);
});



app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const emailExists = findUserByEmail(userEmail, users);
  const hashPass = bcrypt.hashSync(userPass, 10);


//if email or password are empty strings, send 400 response
if (userEmail === "" || userPass === "") {
  return res.status(400).send ('400 Error! This field cannot be blank.');
}
//if email already exists, send 400 response
if (emailExists) {
  return res.status(400).send ('400 Error! This email is already taken.');
//push new user elements to users object
} 

users[userID] = {};
users[userID]["id"] = userID;
users[userID]["email"] = userEmail;
users[userID]["password"] = hashPass;

  res.cookie('user_id', userID);
  res.redirect('/urls');
});

  
//****DELETE BUTTON REDIRECTS BACK TO /URLS*/
app.post("/urls/:id/delete", (req, res) => {
const userID = req.cookies["user_id"];

//cannot delete a URL if not logged in//can't delete someone else's
  if (!userID) {
    return res.status(403).send("Error 1");
  }
  if (urlDatabase[req.params.id].userID !== req.cookies["user_id"]) {
    res.status(403).send("Error 2");
  delete urlDatabase[req.params.id]
  res.redirect('/urls');
  }
});



//****EDIT BUTTON REDIRECTS BACK TO /URLS */
app.post("/urls/:id/update", (req, res) => {
const userID = req.cookies["user_id"];

  if ((!userID) || (urlDatabase[req.params.id].userID !== userID)) {
    return res.status(403).send("Error! You do not have access to edit this URL");
  }
   urlDatabase[req.params.id].longURL = (req.body.longURL);
  res.redirect('/urls');
});
  
//*****LOGIN, CREATE COOKIE*******/
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const user = findUserByEmail(userEmail, users);
  
  if (!user) {
    return res.status(403).send(`ERROR: ${userEmail} cannot be found.`);
  }
  if (bcrypt.compareSync(user.password, userPass)) {
    return res.status(403).send('ERROR: Incorrect password!');
  }

  res.cookie('user_id', userEmail);
  res.redirect('/urls');
});

//*****LOGOUT & CLEAR COOKIE*******/
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

//LISTENER
app.listen(PORT, () => {
  console.log(`Tiny Url app listening on port ${PORT}!`);
});

  
