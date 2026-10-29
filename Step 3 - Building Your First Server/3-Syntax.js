/*
=====================================================================
 STEP 3 — BUILDING YOUR FIRST SERVER
 Items 22-29: raw http, req/res, env variables, Express setup, CORS,
 route/query/body parsing, custom + error middleware, express.Router()
=====================================================================
*/

/*
=====================================================================
 3 — BUILDING YOUR FIRST SERVER SYNTAX REFERENCE
 Items 22-24 of the roadmap: raw http, req/res, environment variables
=====================================================================
*/


// ============================================================
// 22 — RAW http MODULE, NO FRAMEWORK
// ============================================================

const http = require("http");

const server = http.createServer((req, res) => {
  // runs on EVERY incoming request
});

server.listen(3000, () => console.log("running"));

// listening on a SPECIFIC network interface, not just localhost —
// this is what lets another device on the same WiFi reach the server
server.listen(3000, "0.0.0.0", () => console.log("running"));

// localhost ALWAYS means "this same computer" — a different computer
// typing localhost:3000 asks ITS OWN machine, never yours. To let
// another device reach your server on the same WiFi, they need your
// machine's actual local IP (find it with `hostname -I`), not "localhost".
// HTTPS requires an SSL/TLS certificate — plain http (used here) has
// none, which is completely normal and expected for local development.


// ============================================================
// 23 — req/res OBJECTS, HEADERS, RESPONSES (raw http)
// ============================================================

// req.url        -> "/about"      (the path that was requested)
// req.method     -> "GET"         (which HTTP verb was used)
// req.headers    -> object of ALL headers the browser sent

// res.setHeader("Content-Type", "text/html");
// res.setHeader("Cache-Control", "max-age=10");
// res.statusCode = 200;    // set BEFORE calling res.end()
// res.end(data);           // sends the response AND closes the connection

// MANUAL route matching — what Express's app.get() replaces. On raw
// http, YOU do this string work by hand:
const id = "/user/123".split("/user/")[1];             // "123"
const queryString = "/search?q=backend".split("?")[1]; // "q=backend"
"/user/123".startsWith("/user/");                        // true
Number("123");                                             // 123
// THIS is exactly why Express exists — req.params.id and req.query do
// all of this splitting/parsing automatically.


// ============================================================
// 24 — ENVIRONMENT VARIABLES (dotenv)
// ============================================================

// dotenv reads a ".env" file in your project root and loads its
// values into process.env automatically.
//
// .env file contains lines like:
//   PORT=3000
//   DATABASE_URL=some-connection-string
//
// require("dotenv").config();
// MUST be the very first line that runs in your entry file.

// require("dotenv").config();   // <- top of index.js

const port = process.env.PORT || 3000;      // with a fallback default
const dbUrl = process.env.DATABASE_URL;     // no fallback — undefined if missing

// WHY: secrets (API keys, DB passwords, connection strings) live in
// .env, NEVER hardcoded in code, and .env itself goes in .gitignore —
// never pushed to GitHub.
/*
=====================================================================
 4 — STEP 4 CORE ARCHITECTURE SYNTAX REFERENCE
 Items 25-29 of the roadmap: Express setup, CORS, route/query/body
 parsing, middleware, express.Router()
=====================================================================
*/

const cors = require("cors");
const express = require("express");
const path = require("path");
const app = express();


// ============================================================
// 25 — EXPRESS SETUP: app, routes, all core methods
// ============================================================

// const app = express();
// Calling the express FUNCTION returns an app object — every route
// and setting attaches to THIS object. Replaces raw http.createServer.

// -- app.get/post/put/delete(path, handler) — one per HTTP method --
app.get("/", (req, res) => {
  res.send("Homepage");
});
app.get("/about", (req, res) => {
  res.send("About page");
});
// POST = browser SENDING data (form/API call), not just visiting a
// page. Test with curl, not a browser address bar — typing a URL
// always sends GET: curl -X POST http://localhost:3000/submit
app.post("/submit", (req, res) => {
  res.send("Form received");
});
// PUT = update something. DELETE = remove something.
app.put("/update", (req, res) => {
  res.send("Something updated");
});
app.delete("/remove", (req, res) => {
  res.send("Something deleted");
});

// -- res methods — every way to send a response --
// res.send(data) — auto-detects content type: string -> text/html,
// object -> JSON automatically. No manual header-setting needed.
app.get("/text-example", (req, res) => {
  res.send("Just plain text or HTML");
});
// res.json(data) — same result as res.send() with an object, explicit
app.get("/json-example", (req, res) => {
  res.json({ name: "Rehan", role: "student" });
});
// res.status(code) — sets status, returns res again so you CHAIN
app.get("/not-found-example", (req, res) => {
  res.status(404).send("Nothing here");
});
// res.sendFile(absolutePath) — sends a file directly. NOTE: behavior
// differs between Express 4 and 5 (caused real NotFoundError crashes
// before). fs.readFile + res.send() is a safer, predictable alternative.
app.get("/file-example", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});
// res.redirect(url) — tells the browser to go to a different URL
app.get("/old-page", (req, res) => {
  res.redirect("/about");
});

// -- app.use(middleware) — full depth in section 28 below --
app.use(cors());                                            // 26
app.use(express.json());                                    // 27
app.use(express.static(path.join(__dirname, "static")));
// serves every file inside "static" automatically, no per-file route

// -- app.listen(port, callback) — actually STARTS the server --
// Nothing above starts anything, only configures the app.
// (actual call placed at the very end of this file)


/* =====================================================================
   26 — CORS: cross-origin fundamentals, preflight, cors middleware
   ---------------------------------------------------------------
   WHAT "CROSS-ORIGIN" MEANS: browsers block a webpage from one origin
   (localhost:5500) from making requests to a DIFFERENT origin
   (localhost:3000) by default — different port, domain, or protocol
   all count as different origins. A BROWSER security rule, not a
   Node/Express thing.

   PREFLIGHT (OPTIONS request): before certain requests (a POST with
   JSON, custom headers), the browser AUTOMATICALLY sends a separate
   OPTIONS request FIRST, asking "are you okay receiving this from
   this origin?" Only if the server says yes does it send the real
   request. cors() middleware answers this automatically — you never
   write OPTIONS handling by hand.

   RAW HTTP FIX (manual, one header):
     res.setHeader("Access-Control-Allow-Origin", "*")

   EXPRESS FIX:
     npm install cors
     const cors = require("cors");
     app.use(cors());              // allow ALL origins — fine for learning
     app.use(cors({ origin: "http://localhost:5500" }));  // restrict to one

   Must be placed BEFORE the routes it should protect.
===================================================================== */


/* =====================================================================
   27 — ROUTE PARAMS, QUERY PARAMS, BODY PARSING
   ---------------------------------------------------------------
   ROUTE PARAMS — dynamic segments in the URL path. ":id" is a named
   parameter, extracted automatically into req.params.id.
     app.get("/user/:id", ...) + visiting "/user/123"
     -> req.params.id === "123"

   QUERY PARAMS — the part of a URL after "?", parsed automatically.
     app.get("/search", ...) + visiting "/search?q=backend"
     -> req.query === { q: "backend" }

   BODY PARSING — app.use(express.json()) required BEFORE any route
   reading req.body, or req.body is undefined.
===================================================================== */

app.get("/user/:id", (req, res) => {
  res.send(`Requested id: ${req.params.id}`);
});
app.get("/search", (req, res) => {
  res.send(`Search Result ${JSON.stringify(req.query)}`);
});
app.post("/feedback", (req, res) => {
  res.send(`Feedback received: ${JSON.stringify(req.body)}`);
});


/* =====================================================================
   29 — express.Router() FOR MODULAR ROUTES — DEEP DIVE
   ---------------------------------------------------------------
   WHY IT EXISTS: without a Router, every route sits in one file —
   fine at 5 routes, unmanageable at 50. Router lets you split routes
   into separate files by feature, then plug them into the main app.

   STEP 1 — in a SEPARATE file, e.g. routes/blog.js:
     const express = require("express");
     const router = express.Router();
     router.get("/", (req, res) => res.send("Blog home"));
     router.get("/:id", (req, res) => res.send(`Blog post ${req.params.id}`));
     module.exports = router;
   router.get() works EXACTLY like app.get() — same signature, same
   behavior. The difference: router is NOT connected to anything
   until another file plugs it in — self-contained, portable routes.

   STEP 2 — in the MAIN file, import and MOUNT it:
     const blogRoutes = require("./routes/blog");
     app.use("/blog", blogRoutes);

   "MOUNTING": app.use("/blog", blogRoutes) means every route INSIDE
   blogRoutes gets "/blog" automatically prefixed onto it.
     router.get("/")     -> becomes reachable at /blog/
     router.get("/:id")  -> becomes reachable at /blog/5
   The router file never knows or cares about that prefix — it
   defines routes relative to ITSELF. The mount point (decided in the
   main file) places those routes somewhere in the full app. Mounted
   differently, e.g. app.use("/api/posts", blogRoutes), the same
   router's routes would live at /api/posts/ instead.

   WHY THIS MATTERS — the resulting folder structure:
     index.js          <- wires everything together, decides mount points
     routes/
       blog.js          <- only knows about blog-related routes
       users.js          <- (later) only knows about user-related routes
   Each file stays small, focused on ONE thing — the FIRST layer of
   the Controller-Service-Repository pattern, splitting routing
   concerns out of business logic.
===================================================================== */

const blogRoutes = require("./routes/blog");
app.use("/blog", blogRoutes);


/* =====================================================================
   28 — CUSTOM + ERROR-HANDLING MIDDLEWARE — DEEP DIVE
   ---------------------------------------------------------------
   THE CORE SHAPE: every middleware function is (req, res, next).
   Express calls it BEFORE the matching route handler runs.

   HOW next() CHAINS MIDDLEWARE TOGETHER:
     app.use((req, res, next) => { console.log("mw 1"); next(); });
     app.use((req, res, next) => { console.log("mw 2"); next(); });
     app.get("/", (req, res) => { console.log("handler"); res.send("done"); });
   Hitting "/" prints, in order: mw 1, mw 2, handler. Each middleware
   calls next() to hand control onward. The route handler is really
   just the LAST "middleware" in the chain — the one that sends a
   response instead of calling next().

   IF YOU FORGET next(): the request hangs FOREVER — the browser sits
   there loading, nothing ever responds. Common early bug.

   THREE KINDS YOU'LL ACTUALLY USE:
   1) APP-LEVEL, runs on EVERYTHING (no path given):
        app.use(express.static(path.join(__dirname, "static")));
   2) PATH-SCOPED, only for requests starting with a path:
        app.use("/admin", (req, res, next) => { ...; next(); });
      Only fires for /admin, /admin/settings — not / or /about.
   3) ERROR-HANDLING — FOUR parameters, not three:
        app.use((err, req, res, next) => {
          console.error(err.stack);
          res.status(500).send("Something broke");
        });
      Express recognizes this by the 4-argument signature. Must be
      placed LAST — after every route/middleware, including 404.
      When a route throws, Express skips straight to this handler
      instead of crashing the server or leaking a raw stack trace.

   ORDER MATTERS, GENUINELY: middleware runs TOP TO BOTTOM, in the
   order written with app.use(). express.static() AFTER routes
   instead of before means requests hit routes first and might never
   reach the static file check at all.
===================================================================== */

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/broken", (req, res) => {
  throw new Error("something broke on purpose");
});

// 404 catch-all — only reached if NOTHING above matched
app.use((req, res) => {
  res.status(404).send("<p>404 Page not found</p>");
});

// error handler — 4 params, MUST be last
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send("Something went wrong");
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});


/* =====================================================================
   FULL MIDDLEWARE/ROUTE ORDER SUMMARY (why this specific order)
   ---------------------------------------------------------------
   1. cors()                    -> before routes, adds CORS header
   2. express.json()            -> before routes that read req.body
   3. express.static()          -> before routes, serves static files
   4. logging middleware         -> before routes, logs every request
   5. blog routes (Router)       -> specific routes first
   6. other specific routes (/user/:id, /search, /feedback, /broken)
   7. 404 catch-all app.use()    -> only reached if nothing above matched
   8. error handler (4 params)   -> only reached when something throws

   Express checks top to bottom. Anything placed out of this order
   either never runs, runs too early, or breaks something silently —
   order is not optional in Express middleware.
===================================================================== */