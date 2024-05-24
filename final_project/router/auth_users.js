const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const e = require("express");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {};

const authenticatedUser = (name, pass) => {
  const reg_user = users.filter((user) => {
    return user.username === name && user.password === pass;
  });
  return reg_user.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Invalid request" });
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username: username }, "access", {
      expiresIn: "1h",
    });
    req.session.authorization = { accessToken };
    return res.status(200).json({ message: "User logged in successfully" });
  } else {
    return res.status(403).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const token = req.session.authorization["accessToken"];
  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "User not authenticated" });
    }
  });
  const { username } = jwt.decode(token);
  if (!isbn || !review) {
    return res.status(400).json({ message: "Invalid request" });
  }
  if (books[isbn]) {
    books[isbn].reviews = { ...books[isbn].reviews, [username]: review };
    return res
      .status(200)
      .json({
        message: "Review added successfully",
        review: books[isbn].reviews,
      });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const token = req.session.authorization["accessToken"];
  jwt.verify(token, "access", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "User not authenticated" });
    }
  });
  const { username } = jwt.decode(token);
  if (!isbn) {
    return res.status(400).json({ message: "Invalid request" });
  }
  if (books[isbn]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
