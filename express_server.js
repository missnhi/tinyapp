const express = require("express");
const app = express();
const PORT = 8080;
const validUrl = require('valid-url');

// Set the view engine to ejs
app.set("view engine", "ejs");

// In-memory database to store URLs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Function to generate a random string for the shortURL: ex: b2xVn2
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

console.log(generateRandomString());

// Middleware to parse the body of POST requests
app.use(express.urlencoded({extended: true}));

// POST route to receive the form submission and create a new short URL
app.post("/urls", (req, res) => {
  let id = generateRandomString();
  // Check if id already exists, generate a new one if it does
  while (urlDatabase[id]) {
    id = generateRandomString();
  }
  // Validate the longURL is valid
  let longURL = req.body.longURL;
  if (!validUrl.isUri(longURL)) {
    return res.redirect(`/urls/new?error=Invalid URL format`);
  }
  
  // Add a new key-value pair to the urlDatabase object
  urlDatabase[id] = longURL;
  
  // Redirect to the newly created short URL page
  res.redirect(`/urls/${id}`);
});

// POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  // Redirect to the URLs index page
  res.redirect("/urls");
});

// POST route to update a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  // Update the long URL for the given short URL id
  urlDatabase[id] = req.body.newLongURL;
  res.redirect("/urls");
});

//POST to /login to set a cookie that is the username
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

// GET route for the home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GET route to return the URL database as JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET route to render the URLs index page
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

// GET route to render the new URL creation page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// GET route to render the page for a specific short URL
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

// GET route to redirect to the long URL for a given short URL id
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  
  if (!longURL) {
    return res.status(404).send("URL not found");
  }
  
  res.redirect(longURL);
});