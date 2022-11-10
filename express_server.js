//******SETUP******//
const express = require("express");
const app = express();
const PORT = 8080; //default port
app.set("view engine", "ejs");

//******CONVERTS POST REQUEST INTO READABLE STRING******//
app.use(express.urlencoded({ extended: true }));


//******RANDOM ID FOR SHORT URLS ******//
const generateRandomString = function () {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

//******DATABASE OBJECT******//
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//****************************GET REQUESTS****************************//

//******HOMEPAGE******//
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
   const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//******/URLS/NEW TO DISPLAY URL FORM******//
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

//******REDIRECTS TO LONG URL******//
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//****************************POST REQUESTS****************************//

//******/CREATES SHORT URL FOR A LONG ONE, REDIRECTS******//
app.post("/urls", (req, res) => {
  //console.log(req.body); 
  const shortURL = generateRandomString();
      urlDatabase[shortURL] = (req.body.longURL);
      res.redirect(`/urls/${shortURL}`);
//log updated urlDatabase obj      
      console.log(urlDatabase);
  });
  
  //****DELETE BUTTON REDIRECTS BACK TO /URLS*/
  app.post("/urls/:id/delete", (req, res) => { 
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  });

//****EDIT BUTTON REDIRECTS BACK TO /URLS */
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = (req.body.longURL) 
    res.redirect('/urls');
  });
  
//LISTENER
app.listen(PORT, () => {
  console.log(`Tiny Url app listening on port ${PORT}!`);
});

  
