const express = require("express");
const app = express();
const PORT = 8080; //default port
app.set("view engine", "ejs");

const generateRandomString = function () {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
console.log(generateRandomString());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//body-parser middleware converts POST request from buffer into a string
app.use(express.urlencoded({ extended: true }));

//homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//get data in JSON format, /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//get data in HTML, /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//route handler for /urls
app.get("/urls", (req, res) => {
   const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//route handler to show URL form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//route handler for /urls/:id
app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

//match POST request handler
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
      urlDatabase[shortURL] = (req.body.longURL);
      console.log(urlDatabase);
      res.redirect(`/urls/${shortURL}`);
  });
  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

console.log(urlDatabase);
  

