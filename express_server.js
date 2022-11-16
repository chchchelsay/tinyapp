////SETUP PACKAGES////
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const PORT = 8080; //default port
const app = express();
//TEMPLATE ENGINE
app.set("view engine", "ejs");
//BODY PARSER
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  session: 'session',
  keys: ['key1', 'key2']
}));


////HELPER FUNCTIONS////
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser
} = require('./helpers')

  
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



//******/urls shows list of saved shortened URLS******//
app.get("/urls", (req, res) => {

  const templateVars = {
  urls: urlsForUser(req.session.user_id, urlDatabase),
  user: users[req.session.user_id]
};

if (!req.session.user_id) {
  res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
}
  res.render('urls_index', templateVars);
});




//******/urls/new shows form to shorten and submit a new URL******//
app.get("/urls/new", (req, res) => {

  const templateVars = {
    user: users[req.session.user_id]
  };

  //cannot create a new one if not logged in
  if (!req.session.user_id) {
     res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
  }
    res.render("urls_new", templateVars);
});




//******/u/:id redirects short URL to its represented long url address******//
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  
  if (!urlDatabase[shortURL]) {
    res.status(404).send ('Error! Tiny URL does not exist...yet.');
    }   
  res.redirect(longURL);
});





//******/urls:id shows the longURL, short version, allows you to update short version******//
app.get("/urls/:id/update", (req, res) => {
  
  const templateVars = {
    id: req.params.id,
    user: users[req.session.user_id],
    longURL: urlDatabase[req.params.id].longURL,
  };

  //if not logged in
  if (!req.session.user_id) {
    res.send(`<html><body><p><a href="/login">Please login first!</a></p></html>`);
  }
  //if tiny saved url doesn't exist
  if (!urlDatabase[req.params.id]) {
    res.status(403).send ('ERROR: Tiny URL does not exist...yet.');
  }   
//cannot access if it's not your saved URL
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(401).send(`ERROR: Cannot access ${req.params.id}`);
  }

  res.render('urls_show', templateVars);
});




//*******/register prompts user to sign up with an email and password*/
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
    };
  
if (req.session.user_id) {
   res.redirect('/urls');
}
  res.render('urls_register', templateVars);
});




app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  
  if (req.session.user_id) {
   res.redirect('/urls');
  }
  res.render("urls_login", templateVars)
});




//*****POST REQUESTS****************************//

//******/CREATES SHORT URL FOR A LONG ONE, REDIRECTS******//
app.post("/urls", (req, res) => {
  
  if (!req.session.user_id) {
    res.status(403).send ('ERROR: You must be logged in to proceed.');
  };
  if (req.session.user_id) {
    const shortURL = generateRandomString();

    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
console.log(urlDatabase);
    res.redirect("/urls/");
  }
});



app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const emailExists = getUserByEmail(userEmail, users);
  const hashPass = bcrypt.hashSync(userPass, 10);


//if email or password are empty strings, send 400 response
  if (userEmail === "" || userPass === "") {
    res.status(400).send ('ERROR! This field cannot be blank.');
  }
//if email already exists, send 400 response
  if (emailExists) {
    return res.status(400).send ('ERROR! This email is already in use.');
  } 
//push new user elements to users object
users[userID] = {};
users[userID]["id"] = userID;
users[userID]["email"] = userEmail;
users[userID]["password"] = hashPass;

req.session.user_id = users[userID].id;
res.redirect('/urls');
});





//*****LOGIN, CREATE COOKIE*******/
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const user = getUserByEmail(userEmail, users);
  
  if (!userEmail || !userPass) {
    res.status(403).send("ERROR: Valid email and password required!");
  }
  if (!user) {
    res.status(403).send(`ERROR: ${userEmail} cannot be found.`);
  }
  if (!bcrypt.compareSync(user.password, userPass)) {
    res.status(403).send('ERROR: Incorrect password!');
  }  
  if (bcrypt.compareSync(user.password, userPass)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

//*****LOGOUT & CLEAR COOKIE*******/
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session = null;
  res.redirect('/login');
});


//****EDIT BUTTON REDIRECTS BACK TO /URLS */
app.post("/urls/:id/update", (req, res) => {

//can't edit a URL if not logged in or registered
  if (!req.session.user_id) {
    res.status(403).send("ERROR: You must be logged in to edit a URL.");
  }
//can't edit someone else's URL
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send("ERROR: You do not have permission to edit this URL.");
  }  
  urlDatabase[req.params.id].longURL = (req.body.longURL);
  res.redirect('/urls');
});
  
  
//****DELETE BUTTON REDIRECTS BACK TO /URLS*/
app.post("/urls/:id/delete", (req, res) => {

  //cannot delete a URL if not logged in or registered
    if (!req.session.user_id) {
      res.status(403).send("ERROR: You must be logged in to delete a URL.");
    }
//can't delete someone else's URL
    if (urlDatabase[req.params.id].userID !== req.session.user_id) {
      res.status(403).send("ERROR: You do not have permission to delete this URL.");
    }
    delete urlDatabase[req.params.id]
    res.redirect('/urls');
  });

//LISTENER
app.listen(PORT, () => {
  console.log(`Tiny Url app listening on port ${PORT}!`);
});

  
