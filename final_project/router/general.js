const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Task 10: Register a user using Async-Await (Added async/await pattern)
public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if username already exists using async
  try {
    const userExists = await new Promise((resolve, reject) => {
      const user = users.find(user => user.username === username);
      if (user) {
        reject("Username already exists");
      } else {
        resolve(false);
      }
    });

    if (userExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Add the new user
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered." });

  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// Task 10: Get all books available in the shop using Async-Await
public_users.get('/', async function (req, res) {
  try {
    const booksList = await new Promise((resolve, reject) => {
      resolve(books);
    });
    res.status(200).json(booksList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book details based on ISBN using Async-Await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const book = await new Promise((resolve, reject) => {
      const foundBook = books[isbn];
      if (foundBook) {
        resolve(foundBook);
      } else {
        reject("Book not found");
      }
    });

    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Task 12: Get book details based on author using Async-Await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];

  try {
    const booksByAuthorPromise = await new Promise((resolve, reject) => {
      for (let key in books) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          booksByAuthor.push(books[key]);
        }
      }
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject("No books found by this author");
      }
    });

    res.status(200).json(booksByAuthorPromise);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Task 13: Get book details based on title using Async-Await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  try {
    const booksByTitlePromise = await new Promise((resolve, reject) => {
      for (let key in books) {
        if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
          booksByTitle.push(books[key]);
        }
      }
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject("No books found with this title");
      }
    });

    res.status(200).json(booksByTitlePromise);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Task 13: Get book review using Async-Await
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const bookReview = await new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        if (Object.keys(book.reviews).length > 0) {
          resolve(book.reviews);
        } else {
          reject("No reviews for this book");
        }
      } else {
        reject("Book not found");
      }
    });

    res.status(200).json(bookReview);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

module.exports.general = public_users;
