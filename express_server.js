const express = require("express");
const app = express();
const PORT = 8080; //default port

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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

//route handler for /urls/:id
//route path: /urls/:id
//request URL: http://localhost:8080/urls/b2xVn2
app.get("/urls/:id", (req, res) => {
  const templateVars = {id: "b2xVn2", longURL: "http://www.lighthouselabs.ca"};
  res.render('urls_show', templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});