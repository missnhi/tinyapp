const express = require("express");
const app = express();
const PORT = 8080;
const validUrl = require('valid-url');

//Set the view engine to ejs
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//Function to generate a random string for the shortURL: ex: b2xVn2
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

console.log(generateRandomString());


//POST requests body parsing middleware to make the POST body human readable.
app.use(express.urlencoded({extended: true}));

//a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  let id = generateRandomString();
  //check if id already exists
  while (urlDatabase[id]) {
    //if it does, generate until a new id is there
    id = generateRandomString();
  }
  //validate the longURL is valid
  let longURL = req.body.longURL;
  if (!validUrl.isUri(longURL)) {
    return res.redirect(`/urls/new?error=Invalid URL format`);
  }
  
  urlDatabase[id] = longURL; // Add a new key-value pair to the urlDatabase object
  
  // redirection to /urls/:id
  res.redirect(`/urls/${id}`);
});

//POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  // redirection to urls_index page ("/urls")
  res.redirect("/urls");
});

//POSt route to update a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newLongURL;
  res.redirect("/urls");
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  
  if (!longURL) {
    return res.status(404).send("URL not found");
  }
  
  res.redirect(longURL);
  
});




