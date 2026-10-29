const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h1>Welcome to My Website</h1>");
});

router.get("/about", (req, res) => {
  res.send("<h1>Welcome to My Website</h1> <p>My Website About </p>");
});

router.get("/home", (req, res) => {
  res.send("<h1>Welcome to My Website</h1> <p>My Website Home </p>");
});

router.get("/services", (req, res) => {
  res.send("<h1>Welcome to My Website</h1> <p>My Website Service</p>");
});

router.get("/contact", (req, res) => {
  res.send("<h1>Welcome to My Website</h1>  <p>My Website Contact</p>");
});

router.get("/:id", (req, res) => {
  res.send(`Blog post ${req.params.id}`);
});

module.exports = router;

module.exports = router;
