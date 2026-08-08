
require("dotenv").config();

let bookmarks = [
  { id: 1, title: "Google", url: "https://google.com" },
  { id: 2, title: "GitHub", url: "https://github.com" },
];

const http = require("http");

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const url = req.url;
  console.log(url);
  if (url === "/") {
    res.statusCode = 200;

    res.end("website");
  } else if (url === "/bookmark") {
    res.statusCode = 200;
    res.end(JSON.stringify(bookmarks));
  } else if (url.startsWith("/bookmark/")) {
    const id = Number(url.split("/bookmark/")[1]);
    const mark = bookmarks.find((x) => x.id === id);
    if (!mark) {
      res.statusCode = 404;
      res.end("bookmark not found");
    } else {
      res.statusCode = 200;

      res.end(JSON.stringify(mark));
    }
  } else {
    res.statusCode = 404;
    res.end("not found");
  }
});

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
