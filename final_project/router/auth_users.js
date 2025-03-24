const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Find the user in the users array
  const user = users.find(user => user.username === username && user.password === password);

  if (!user) {
    return res.status(400).json({ message: "Invalid username or password." });
  }

  // If user is found, generate a token (JWT)
  const token = jwt.sign({ username }, 'secretkey', { expiresIn: '1h' });

  // Save the token in session (if needed)
  req.session.token = token;

  // Respond with the token
  return res.status(200).json({ message: "Login successful", token });
});

regd_users.use("/auth/*", (req, res, next) => {
  const token = req.headers["authorization"]; // Token is sent in the Authorization header

  if (!token) {
      return res.status(403).json({ message: "Access Denied: No Token Provided" });
  }

  try {
      // Extract the token from the 'Bearer' format: Bearer <token>
      const decoded = jwt.verify(token.split(" ")[1], "your_secret_key");  // Replace "your_secret_key" with your secret key
      req.user = decoded;  // Attach decoded token (user info) to the request object
      next();  // Proceed to the next middleware or route handler
  } catch (error) {
      return res.status(401).json({ message: "Invalid Token" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review cannot be empty" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update the review for the book
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/modified successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username;  // Extracting username from the decoded JWT token

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the review exists for the user
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
