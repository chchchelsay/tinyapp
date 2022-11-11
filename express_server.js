//******SETUP******//
const express = require("express");
const cookieParser = require('cookie-parser');
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

//******DATABASE OBJECT******//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  res.send("Hello!");
});

//******JSON******//
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//******/hello in html******//
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//******/urls shows list of saved shortened URLS******//
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

//******/urls/new shows form to shorten and submit a new URL******//
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});


//******/urls:id shows the longURL, short version, allows you to update short version******//
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_show', templateVars);
});


//*******/register prompts user to sign up with an email and password*/
app.get("/register", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_register', templateVars);
});

//******/u/:id redirects short URL to its represented long url address******//
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//*****POST REQUESTS****************************//

//******/CREATES SHORT URL FOR A LONG ONE, REDIRECTS******//
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = (req.body.longURL);
  //console.log(shortURL);
  //console.log(req.body.longURL);
  res.redirect(`/urls/${shortURL}`);
  //console.log(urlDatabase);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;

  const templateVars = {
    user: users[userID]
  };
  //push new user elements to users object
  users[userID] = {};
  users[userID]["id"] = userID;
  users[userID]["email"] = userEmail;
  users[userID]["password"] = userPass;
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

  
//****DELETE BUTTON REDIRECTS BACK TO /URLS*/
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//****EDIT BUTTON REDIRECTS BACK TO /URLS */
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = (req.body.longURL);
  res.redirect('/urls');
});
  
//*****LOGIN WITH USERNAME, CREATE COOKIE*******/
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//*****LOGOUT & CLEAR COOKIE*******/
app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body);
  res.redirect('/urls');
});

//LISTENER
app.listen(PORT, () => {
  console.log(`Tiny Url app listening on port ${PORT}!`);
});

  
