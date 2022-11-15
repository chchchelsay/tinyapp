//******SETUP******//
const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

const {
  getUserByEmail,
  generateRandomString,
  urlsForUser
} = require('./helpers')

const PORT = 8080; //default port
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  session: 'session',
  keys: ['key1', 'key2']
}));

  
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
  
  if (req.session.user_id) {
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
if (!req.session.user_id) {
  res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
}

const templateVars = {
  urls: urlsForUser(req.session.user_id, urlDatabase),
  user: users[req.session.user_id]
};
  res.render('urls_index', templateVars);
});




//******/urls/new shows form to shorten and submit a new URL******//
app.get("/urls/new", (req, res) => {
  
  //cannot create a new one if not logged in
  if (!req.session.user_id) {
    res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
  
  }
    const templateVars = {
      user: users[req.session.user_id]
    };

    res.render("urls_new", templateVars);
});




//******/u/:id redirects short URL to its represented long url address******//
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  
  if (!req.session.user_id) {
    res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
  }
  if (!urlDatabase[shortURL]) {
    res.status(403).send ('Error! Tiny URL does not exist...yet.');
    }   
  res.redirect(longURL);
});





//******/urls:id shows the longURL, short version, allows you to update short version******//
app.get("/urls/:id", (req, res) => {
  
  //if not logged in
  if (!req.session.user_id) {
    res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
  }
  //if tiny saved url doesn't exist
  if (!urlDatabase[req.params.id]) {
    res.status(403).send ('Error! Tiny URL does not exist...yet.');
  }   
//cannot access if it's not your saved URL
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(401).send(`Error! Cannot access ${req.params.id}`);
  }

  const templateVars = {
    id: req.params.id,
    user: users[req.session.user_id],
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render('urls_show', templateVars);
});




//*******/register prompts user to sign up with an email and password*/
app.get("/register", (req, res) => {

if (req.session.user_id) {
  res.redirect('/urls');
}
  const templateVars = {
  user: users[req.session.user_id]
  };
  res.render('urls_register', templateVars);
});




app.get("/login", (req, res) => {
  
  if (req.session.user_id) {
    res.redirect('/urls');
  }

  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars)
});




//*****POST REQUESTS****************************//

//******/CREATES SHORT URL FOR A LONG ONE, REDIRECTS******//
app.post("/urls", (req, res) => {
  
  if (!req.session.user_id) {
    return res.status(401).send ('401 Error! You must be logged in to proceed.');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: (req.body.longURL),
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});



app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const emailExists = getUserByEmail(userEmail, users);
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

req.session.user_id = userID;
  res.redirect('/urls');
});

  
//****DELETE BUTTON REDIRECTS BACK TO /URLS*/
app.post("/urls/:id/delete", (req, res) => {

//cannot delete a URL if not logged in//can't delete someone else's
  if (!req.session.user_id) {
    res.status(403).send("Error 1");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("Error 2");

  delete urlDatabase[req.params.id]
  res.redirect('/urls');
  }
});



//****EDIT BUTTON REDIRECTS BACK TO /URLS */
app.post("/urls/:id/update", (req, res) => {

  if ((!req.session.user_id) || (urlDatabase[req.params.id].userID !== req.session.user_id)) {
    return res.status(403).send("Error! You do not have access to edit this URL");
  }
   urlDatabase[req.params.id].longURL = (req.body.longURL);
  res.redirect('/urls');
});
  
//*****LOGIN, CREATE COOKIE*******/
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const user = getUserByEmail(userEmail, users);
  
  if (!user) {
    return res.status(403).send(`ERROR: ${userEmail} cannot be found.`);
  }
  if (bcrypt.compareSync(user.password, userPass)) {
    return res.status(403).send('ERROR: Incorrect password!');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

//*****LOGOUT & CLEAR COOKIE*******/
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//LISTENER
app.listen(PORT, () => {
  console.log(`Tiny Url app listening on port ${PORT}!`);
});

  
