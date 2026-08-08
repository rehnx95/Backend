const http = require("http");
const path = require("path");
const fs = require("fs");

const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html");
  console.log(req.url);
  if (req.url === "/") {
    res.statusCode = 200;
    const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

    res.end(html);
  } else if (req.url === "/about") {
    res.statusCode = 200;

    res.end("<h1>Welcome to My Website</h1> <p>My Website About </p>");
  } else if (req.url === "/home") {
    res.statusCode = 200;
    const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

    res.end(html);
  } else if (req.url === "/services") {
    res.statusCode = 200;

    res.end("<h1>Welcome to My Website</h1> <p>My Website Service</p>");
  } else if (req.url === "/contact") {
    res.statusCode = 200;

    res.end("<h1>Welcome to My Website</h1>  <p>My Website Contact</p>");
  } else {
    res.statusCode = 404;

    res.end("<p>404 Page not found</p>");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on Port ${port}`);
});
