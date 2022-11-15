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

//******JSON******//
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//******/hello in html******//
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//******homepage******//
app.get("/", (req, res) => {
  res.redirect("/urls");
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
  const userID = req.cookies["user_id"];
  
  if (!userID) {
    res.redirect("/login");

  } else {
    const templateVars = {
      user: users[userID]
    };

  res.render("urls_new", templateVars);
  }
});


//******/urls:id shows the longURL, short version, allows you to update short version******//
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    user: users[req.cookies["user_id"]],
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render('urls_show', templateVars);
});

//******/u/:id redirects short URL to its represented long url address******//
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[req.params.id];

if (!urlDatabase[shortURL]) {
  res.status(403).send ('Error! Tiny URL does not exist...yet.');
}
else {
  res.redirect(longURL);
}  
});


//*******/register prompts user to sign up with an email and password*/
app.get("/register", (req, res) => {
const userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID]
  };

  if (userID) {
    res.redirect('/urls');
  }
  res.render('urls_register', templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];

  const templateVars = {
    user: users[userID]
  };

  if (userID) {
    res.redirect('/urls');
  }
  res.render("urls_login", templateVars)
});

//*****POST REQUESTS****************************//

//******/CREATES SHORT URL FOR A LONG ONE, REDIRECTS******//
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];

  if (!userID) {
    return res.status(401).send ('401 Error! You must be logged in to proceed.');
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: (req.body.longURL)
  };
  res.redirect(`/urls/${shortURL}`);
});



app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const emailExists = findUserByEmail(userEmail, users);

  const templateVars = {
    user: users[userID]
  };
//if email or password are empty strings, send 400 response
  if (userEmail === "" || userPass === "") {
    return res.status(400).send ('400 Error! This field cannot be blank.');
  }
//if email already exists, send 400 response
  if (emailExists) {
    return res.status(400).send ('400 Error! This email is already taken.');
//push new user elements to users object
  } else {
  users[userID] = {};
  users[userID]["id"] = userID;
  users[userID]["email"] = userEmail;
  users[userID]["password"] = userPass;
  };
  
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
  
//*****LOGIN, CREATE COOKIE*******/
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  const user = findUserByEmail(userEmail, users);
  
  if (!user) {
    return res.status(403).send(`403 code error ${userEmail} cannot be found.`);
  }
  if (user.password !== userPass) {
    return res.status(403).send("Incorrect password.");
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

  

