const express = require("express");
const fs = require("fs");
const http = require("http");

const port = 2000;
const app = express();

app.get("/", (req, res) => {
  const html = fs.readFileSync("index.html");
  res.send(html.toString());
});

app.get("/about", (req, res) => {
  res.send("<h1>Welcome to My Website</h1> <p>My Website About </p>");
});

app.get("/home", (req, res) => {
  const html = fs.readFileSync("index.html");
  res.send(html.toString());
});

app.get("/services", (req, res) => {
  const html = fs.readFileSync("index.html");
  res.send("<h1>Welcome to My Website</h1> <p>My Website Service</p>");
});

app.get("/contact", (req, res) => {
  const html = fs.readFileSync("index.html");
  res.send("<h1>Welcome to My Website</h1>  <p>My Website Contact</p>");
});

app.listen(port, () => {
  console.log(`srver is running on port ${port}`);
});
