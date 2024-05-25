const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Invalid request" });
  }
  users.map((user) => {
    if (user.username === username) {
      return res.status(400).json({ message: "User already exists" });
    }
  });
  if (username) {
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
  } else {
    return res.status(400).json({ message: "Invalid username" });
  }
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  new Promise((resolve, reject) => {
    if (Object.keys(books).length > 0) {
      resolve({ status: 200, data: books });
    } else {
      reject({ status: 404, message: "No books available" });
    }
  })
    .then((response) => res.status(response.status).json(response.data))
    .catch((err) => {
      res.status(err.status).json(err.message);
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve({ status: 200, data: books[isbn] });
    } else {
      reject({ status: 404, message: "Book Not Found" });
    }
  })
    .then((response) => res.status(response.status).json(response.data))
    .catch((e) => res.status(e.status).json(e.message));
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;
  new Promise((resolve, reject) => {
    let author_books = {};
    for (let book in books) {
      if (books[book].author === author) {
        author_books[book] = books[book];
      }
    }
    if (Object.keys(author_books).length > 0) {
      resolve({ status: 200, data: author_books });
    } else {
      reject({ status: 404, message: "Author Not Found" });
    }
  })
    .then((response) => res.status(response.status).json(response.data))
    .catch((err) => res.status(err.status).json(err.message));
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;
  new Promise((resolve, reject) => {
    let title_books = {};
    for (let book in books) {
      if (books[book].title === title) {
        title_books[book] = books[book];
      }
    }
    if (Object.keys(title_books).length > 0) {
      resolve({ status: 200, data: title_books });
    } else {
      reject({ status: 404, message: "Title Not Found" });
    }
  })
    .then((response) => res.status(response.status).json(response.data))
    .catch((err) => res.status(err.status).json(err.message));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  if (books[isbn]) {
    if (Object.keys(books[isbn].reviews).length > 0) {
      return res.status(200).json(books[isbn].reviews);
    } else {
      return res.status(404).json({ message: "No reviews found" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
