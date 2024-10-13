const express = require("express");
const app = express();
const PORT = 8080;
const validUrl = require('valid-url');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Set the view engine to ejs
app.set("view engine", "ejs");

// Use cookie-parser middleware
app.use(cookieParser());

// In-memory database to store URLs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  const userId = req.cookies["user_id"];
  return users[userId];
}

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

//POST to /login to authenticate the user with the hashed passwords
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  console.log(JSON.stringify(req.body));
  
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
  
  // Compare the entered password with the stored hashed password
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.status(500).send("Internal server error");
    }
    
    if (result) {
      // Passwords match, set the user_id cookie and redirect to /urls
      res.cookie('user_id', user.id);
      res.redirect("/urls");
    } else {
      // Passwords do not match, return an error
      res.status(403).send("Incorrect password");
    }
  });
});


//POST to/logout to clear the cookie
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
  
});

// a POST /register endpoint with hash passwords
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  
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
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      return res.status(500).send("Internal server error when hashing");
    }
    
    // Add the new user to the users object
    users[id] = {
      id,
      email,
      password: hash,
    };
    
    // Set a user_id cookie containing the user's newly generated ID
    res.cookie('user_id', id);
    res.redirect("/urls");
  });
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
  const user = getUserById(req);
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

// GET route to render the new URL creation page
app.get("/urls/new", (req, res) => {
  const user = getUserById(req);
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

// GET route to render the page for a specific short URL
app.get("/urls/:id", (req, res) => {
  const user = getUserById(req);
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user,
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

//GET route to /register endpoint
app.get("/register", (req, res) => {
  const user = getUserById(req);
  const templateVars = {
    user,
  };
  res.render("register", templateVars);
});

// GET route to /login endpoint with login.ejs
app.get("/login", (req, res) => {
  const user = getUserById(req);
  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});