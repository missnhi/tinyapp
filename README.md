# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la
bit.ly).

## Final Product

!["Login Page"](https://github.com/missnhi/tinyapp/blob/main/docs/login-page.png)
!["URL Page"](https://github.com/missnhi/tinyapp/blob/main/docs/url-page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.

## Features and Requirements

### Template Engine - EJS

- **EJS** is used as the template engine.
- Routes for `/urls` and `/urls/:id` are added in `express_server.js` and rendered using accompanying templates.
- The header partial is included inside `urls_index.ejs` and `urls_show.ejs` at the top of the body.

### URL Shortening (Part 1)

- Added a GET route to `express_server.js` and rendered using the accompanying template.
- Added a POST route to `express_server.js` to receive form submissions.

### URL Shortening (Part 2)

- Updated `express_server.js` to store short-url and long-url key-value pairs in the database when a POST request is
  received to `/urls`.
- Updated `express_server.js` to respond with a redirect from `/urls` to `/urls/:id`.

### Deleting URLs

- In `urls_index.ejs` template, added a form element for each shortURL which uses a POST method.
- Added a POST route for `/urls/:id/delete` to remove URLs.

### Updating URLs

- Added a form to `urls_show.ejs` that submits an updated longURL.
- Added an Edit button to each object in `urls_index.ejs` which takes you to the appropriate `urls_show` page.
- Added a POST route for `/urls/:id` to update a resource.

### Cookies in Express

- Added a POST route for `/login` to `express_server.js`.
- Redirected the browser back to the `/urls` page after a successful login.

### Displaying Username with cookie-parser

- Modified `_header.ejs` to display a username using `cookie-parser`.

### Logout and Clear Cookies

- Added a POST route for `/logout` which clears the cookie and redirects the user to the `/urls` page.

### User Registration Form

- Created a new template with a form containing email and password fields.
    - Email field uses `type=email` and has `name=email`.
    - Password field uses `type=password` and has `name=password`.
    - Form POSTs to `/register`.
- Added a GET route for `/register` which renders the registration template.

### Registering New Users

- Added a POST route for `/register` which:
    - Adds a new user object to the global `users` object.
    - Sets the `userid` cookie.
    - Redirects the user to the `/urls` page.
- Updated all endpoints that pass the username value to templates to pass the entire user object to the template instead
  and changed logic as follows:
    - Look up the user object in the `users` object using the `userid` cookie value.
    - Pass the user object to templates.
- Updated `_header.ejs` to show the email instead of the username.

### Registration Errors

- Modified the POST `/register` route to handle the following error conditions:
    - If email/password are empty, send back a response with a 400 status code.
    - If someone tries to register with an email that already exists in the `users` object, send a response back with a
      400 status code (Consider creating an email lookup helper function, `getUserByEmail()`, to keep your code DRY).

### A New Login Page

- Created a new template with a login form which contains an email and password field.
    - Form sends a POST request to `/login`.
- Added a GET route `/login` that renders the appropriate template.
- Modified `_header.ejs` to display a Register link pointing to the Register page.
- Modified `_header.ejs` to display a Login link pointing to the Login page for users not logged in.

### Refactoring the Login Route

- Modified the POST `/login` endpoint to:
    - Use new email and password fields to look up the email address submitted via the form.
    - Set an appropriate `userid` cookie on successful login.
    - Use the same functionality in the register route.
- Modified the logout endpoint to clear the `userid` cookie instead of the username.
- Modified the logout reroute to send users to `/login`.
- Updated any code still using the username cookie to use the new `user_id` cookie.

### Basic Permission Features

- If someone is logged in and visits `/register` or `/login` pages, they will be redirected to `/urls`.
- If someone is not logged in, redirects to the `/login` page.
- If someone is not logged in and visits `/urls/new`, they will be redirected to `/login`.
- If someone makes a POST request to `/urls` and they are not logged in, they should see a relevant error message.
- If someone makes a request for a URL that doesn't exist (no URL with the provided id in our database), they should see
  a relevant error message.
- Every user should be able to visit `/u/:id` whether they are logged in or not.

### More Permission Features

- Created function `urlsForUser(id)` which returns URLs where `userID` equals the id of the logged-in user and updated
  code to:
    - Only display URLs if the user is logged in.
    - Only show URLs that belong to the user when logged in.
    - Otherwise, prompt the user to register or login first.
- Updated `/edit` and `/delete` endpoints so only owners/creators can edit and delete links.

### Storing Passwords Securely

- Modified the registration endpoint to use `bcrypt` to hash and save the password (use `bcrypt.hashSync`).
- Modified the login endpoint to use `bcrypt` to check the password (use `bcrypt.compareSync`).

### Switching to Encrypted Cookies

- All cookie data is encrypted.