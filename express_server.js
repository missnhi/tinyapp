const express = require("express");
const app = express();
const PORT = 8080;
const validUrl = require('valid-url');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Set the view engine to ejs
app.set("view engine", "ejs");

// Use cookie-session middleware
app.use(cookieSession({
  name: 'session',
  keys: ['yourSecretKey1', 'yourSecretKey2'], // Replace with your own secret keys
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// In-memory database to store URLs
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "nhi.phan.ley@gmail.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1234",
  },
};

// Function to generate a random string for the shortURL: ex: b2xVn2
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// Helper function to get user object by user_id cookie
function getUserById(req) {
  const userId = req.session.user_id;
  return users[userId];
}

//filer the URLs by user_id
function urlsForUser(id) {
  const urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}


// Middleware to parse the body of POST requests
app.use(express.urlencoded({extended: true}));


// GET route for the home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

// GET route to return the URL database as JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET route to render the URLs index page
app.get("/urls", (req, res) => {
  const user = getUserById(req);
  //if user not login, redirect to /login
  if (!user) {
    return res.redirect("/login");
  }
  
  //only user that create the URL can see the URL
  const urlOwner = urlsForUser(user.id);
  const templateVars = {
    urls: urlOwner,
    user,
  };
  res.render("urls_index", templateVars);
});

// GET route to render the new URL creation page
app.get("/urls/new", (req, res) => {
  const user = getUserById(req);
  //if user not login (only authorized user can shorten URL), redirect to /login
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

// GET route to render the page for a specific short URL
app.get("/urls/:id", (req, res) => {
  const user = getUserById(req);
  const id = req.params.id;
  
  //if not log in
  if (!user) {
    return res.redirect("/login");
  }
  //if can't find the url id
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }
  //if user is not the owner of the URL
  if (urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to view this URL");
  }
  
  const templateVars = {
    id: id,
    longURL: urlDatabase[id].longURL,
    user,
  };
  res.render("urls_show", templateVars);
});

// GET route to redirect to the long URL for a given short URL id
//ANYBODY can access the short URLs and redirect to the long URL
app.get("/u/:id", (req, res) => {
  // give a HTML error message if the id does not exist at GET /u/:id
  const short_id = req.params.id;
  
  if (!urlDatabase[short_id]) {
    return res.status(404).send("short ID not found");
  }
  
  const longURL = urlDatabase[short_id].longURL;
  
  if (!longURL) {
    return res.status(404).send("URL not found");
  }
  
  res.redirect(longURL);
});

//GET route to /register endpoint
app.get("/register", (req, res) => {
  const user = getUserById(req);
  //if user login, redirect to /urls
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user,
  };
  res.render("register", templateVars);
});

// GET route to /login endpoint with login.ejs
app.get("/login", (req, res) => {
  const user = getUserById(req);
  //if user login, redirect to /urls
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});


// POST route to receive the form submission and create a new short URL
app.post("/urls", (req, res) => {
  //only authorized user can shorten URL
  const user = getUserById(req);
  if (!user) {
    return res.status(401).send("Unauthorized");
  }
  
  //continue if user is authorized
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
  urlDatabase[id] = {
    longURL: longURL,
    userID: user.id,
  };
  
  // Redirect to the newly created short URL page
  res.redirect(`/urls/${id}`);
});

// POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user = getUserById(req);
  
  if (!user) {
    return res.redirect("/login");
  }
  
  if (!urlDatabase[id] || urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to delete this URL");
  }
  
  delete urlDatabase[id];
  // Redirect to the URLs index page
  res.redirect("/urls");
});

// POST route to update a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user = getUserById(req);
  
  if (!user) {
    return res.redirect("/login");
  }
  
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }
  
  if (!urlDatabase[id] || urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to edit this URL");
  }
  
  // Update the long URL for the given short URL id
  const newLongURL = req.body.newLongURL;
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});

//POST to /login to authenticate the user with the hashed passwords
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  
  // Find the user by email
  let user;
  for (const userId in users) {
    if (users[userId].email === email) {
      user = users[userId];
      break;
    }
  }
  
  // If user not found, return an error
  if (!user) {
    return res.status(403).send("Email not found");
  }
  //error checking
  // console.log('Hashed passwords: ', user.password);
  // console.log('Entered password: ', password);
  
  // Compare the entered password with the stored hashed password
  const result = bcrypt.compareSync(password, user.password);
  
  if (result) {
    // Passwords match, set the user_id cookie and redirect to /urls
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    // Passwords do not match, return an error
    res.status(403).send("Incorrect password");
  }
});


//POST to/logout to clear the cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
  
});

// a POST /register endpoint with hash passwords
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  //check for existed new id for user
  let id = generateRandomString();
  while (users[id]) {
    id = generateRandomString();
  }
  
  //check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }
  for (const user in users) {
    if (users[user].email === email) {
      return res.status(400).send("Email already exists");
    }
  }
  
  // Hash the password before storing it
  const hash = bcrypt.hashSync(password, saltRounds);
  
  // Add the new user to the users object
  users[id] = {
    id,
    email,
    password: hash,
  };
  
  // Set a user_id cookie containing the user's newly generated ID
  req.session.user_id = id;
  res.redirect("/urls");
});

