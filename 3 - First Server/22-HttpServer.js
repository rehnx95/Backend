/*
=====================================================================
 STEP 3 — ITEMS 22, 23, 24 — REVISION
 22: Server with Node's raw http module, no framework
 23: req/res objects, headers, streaming a response
 24: Environment variables (.env + process.env)
=====================================================================
*/


/* =====================================================================
   ITEM 22 — RAW http SERVER, NO FRAMEWORK
   ---------------------------------------------------------------
   The most basic possible web server in Node - no Express, no
   third-party packages, just Node's built-in "http" module. This
   is the foundation everything else (including Express) is built
   on top of.

     const http = require("http");
     -> loads Node's built-in HTTP tools. No install needed.

     const server = http.createServer((req, res) => { ... });
     -> takes ONE function that runs automatically on EVERY
        incoming request. It receives two objects:
          req -> information about the incoming request
          res -> the tool used to send a response back

     server.listen(port, callback)
     -> starts the server, listens for requests on the given port.
===================================================================== */

require("dotenv").config(); // must be the first line - see ITEM 24

const http = require("http");
const path = require("path");
const fs = require("fs");


/* =====================================================================
   ITEM 24 — ENVIRONMENT VARIABLES
   ---------------------------------------------------------------
   Values like ports, secrets, and config should never be hardcoded
   directly in code. Two reasons:
     1. Anything hardcoded is visible to anyone who sees the code
        (e.g. pushed to GitHub) - fine for a port number, not fine
        for a password or API key.
     2. Different environments (a laptop vs a deployed server) may
        need different values. Hardcoding forces editing code every
        time that changes.

   1. Install: npm install dotenv

   2. Create a file named exactly ".env" in the project root:
        PORT=3000
      No quotes, no spaces around "=".

   3. At the very top of the server file:
        require("dotenv").config();
      Reads the .env file and loads its values into a global object
      called process.env, so they're available anywhere as
      process.env.SOMENAME.

   4. Create/update ".gitignore" in the project root:
        node_modules
        .env
      Tells Git to never track/upload these - keeps secrets out of
      version control.
===================================================================== */

const port = process.env.PORT || 3000;
// process.env.PORT comes from .env
// "|| 3000" is a fallback: if .env is missing or PORT isn't set,
// process.env.PORT is undefined (falsy), so it falls back to 3000
// instead of crashing or running on an invalid port.


const server = http.createServer((req, res) => {

  /* ===================================================================
     ITEM 23 — req/res OBJECTS, HEADERS, RESPONSES
     -----------------------------------------------------------------
     Every request creates a fresh (req, res) pair. Nothing is
     remembered between requests (this is what "HTTP is stateless"
     means in practice).

     req (the incoming request):
       req.url      -> the path being requested, e.g. "/about"
       req.headers  -> an object of every header the browser sent
                        (host, accept, accept-encoding, user-agent...)
       req.method   -> the HTTP method, e.g. "GET" or "POST"

     res (used to respond):
       res.setHeader(name, value)
         -> sets ONE response header. Can be called multiple times
            before res.end().
       res.statusCode = number
         -> sets the 3-digit HTTP status code. Must be set BEFORE
            res.end() is called.
       res.end(data)
         -> sends the response body and closes it. Nothing more can
            be sent after this is called.
  =================================================================== */

  res.setHeader("Content-Type", "text/html");
  // tells the browser "the body I'm sending is HTML" so it renders
  // it instead of showing raw text

  console.log(req.url);
  console.log(req.headers);
  // logging these shows real header values sent by any browser,
  // e.g.: host, connection, cache-control, accept,
  // accept-encoding, accept-language - confirms headers are real
  // key-value metadata sent on every single request


  if (req.url === "/") {
    res.statusCode = 200;
    // 200 = success. Set here because this branch only runs when
    // the request actually succeeded.

    const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
    // fs.readFileSync reads a file from disk synchronously (code
    // waits/blocks until the read finishes) and returns its
    // contents. path.join(__dirname, "index.html") builds a safe,
    // OS-independent full file path using the current file's
    // directory (__dirname) plus the filename.

    res.setHeader("Cache-Control", "max-age=10");
    // tells the browser "you can reuse this response for up to 10
    // seconds without asking the server again"
    res.setHeader("ETag", '"fake-etag-123"');
    // a fingerprint/identifier for this exact version of the
    // response, normally used together with Cache-Control so the
    // browser can ask "has this changed since I last got it?"

    res.end(html);
    // sends the HTML file's contents as the response body

  } else if (req.url === "/about") {
    res.statusCode = 200;
    res.end("<h1>Welcome to My Website</h1> <p>My Website About </p>");
    // here the response body is a plain string instead of a file
    // read from disk - res.end() accepts either

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

  } else if (req.url.startsWith("/user/")) {
    // req.url.startsWith("/user/") checks if the URL begins with
    // that exact text - true for "/user/123", false for "/about"
    const id = req.url.split("/user/")[1];
    // req.url.split("/user/") breaks the URL string into pieces
    // wherever "/user/" appears, returning an ARRAY of the leftover
    // parts. For "/user/123", split gives ["", "123"].
    // [1] grabs the second item (index 1) from that array - "123".
    res.statusCode = 200;
    res.end(`<p>User ID requested: ${id}</p>`);
    // backticks (`) let you insert a variable directly into a
    // string using ${...} - this is called a template literal

  } else if (req.url.startsWith("/search")) {
    const queryString = req.url.split("?")[1]; // e.g. "q=backend"
    // same splitting technique, but splitting on "?" instead, to
    // grab everything after it - the query string part of the URL
    res.statusCode = 200;
    res.end(`<p>Search query: ${queryString}</p>`);

  } else {
    // CATCH-ALL branch: anything that didn't match any route above
    // ends up here
    res.statusCode = 404;
    // the status code must match what actually happened - a 404
    // response that claims statusCode 200 breaks the whole point
    // of status codes existing
    res.end("<p>404 Page not found</p>");
  }
});


server.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on Port ${port}`);
});
// "0.0.0.0" means "listen on all available network interfaces",
// not just localhost - relevant when accessing the server from
// another device on the same network


/* =====================================================================
   .gitignore (SEPARATE FILE, project root) — required alongside .env
   ---------------------------------------------------------------
       node_modules
       .env
===================================================================== */


/* =====================================================================
   CORS NOTE
   ---------------------------------------------------------------
   Browsers block cross-origin requests by default. If a different
   website's JavaScript calls this raw server with fetch(), it will
   be blocked with an error like:
     "blocked by CORS policy: No Access-Control-Allow-Origin header
      is present"
   even though the server itself responds normally (200 OK) - the
   request DOES reach the server. CORS blocks the BROWSER from
   reading the response, not the server from sending it. This raw
   server never sends an Access-Control-Allow-Origin header, which
   is why any other origin gets blocked. The proper fix (the cors
   package) applies once using Express, covered separately.
===================================================================== */