/*
=====================================================================
 STEP 3 — ITEMS 25, 26, 27, 28, 29 — EXPRESS DEEP-DIVE REVISION
 25: Express setup (app, routes, middleware) + ALL core methods
 26: CORS (cross-origin fundamentals, preflight, cors middleware)
 27: Route params, query params, body parsing
 28: Custom + error-handling middleware (deep dive)
 29: express.Router() for modular routes (deep dive)
=====================================================================
*/

require("dotenv").config();
const cors = require("cors");
const express = require("express");
const path = require("path");

const port = process.env.PORT || 3000;
const app = express();


/* =====================================================================
   25 — EXPRESS SETUP: app, routes, middleware
===================================================================== */

// const app = express();
// Calling the express FUNCTION returns an app object. Every route
// and setting attaches to THIS object. Replaces raw http.createServer.


/* -----------------------------------------------------------------
   25a — app.get(path, handler) — respond to GET requests
   GET = the normal request type when someone just VISITS a URL.
----------------------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("Homepage");
});

app.get("/about", (req, res) => {
  res.send("About page");
});


/* -----------------------------------------------------------------
   25b — app.post(path, handler) — respond to POST requests
   POST = used when the browser is SENDING data (form submit, API
   call), not just visiting a page. Test with curl, not a browser
   address bar — typing a URL always sends GET.
     curl -X POST http://localhost:3000/submit
----------------------------------------------------------------- */
app.post("/submit", (req, res) => {
  res.send("Form received");
});


/* -----------------------------------------------------------------
   25c — app.put(path, handler) / app.delete(path, handler)
   PUT = update something. DELETE = remove something. Used heavily
   later when building a real CRUD API.
----------------------------------------------------------------- */
app.put("/update", (req, res) => {
  res.send("Something updated");
});

app.delete("/remove", (req, res) => {
  res.send("Something deleted");
});


/* -----------------------------------------------------------------
   25d — res methods — every way to send a response
----------------------------------------------------------------- */

// res.send(data) — auto-detects content type: string -> text/html,
// object -> JSON automatically. No manual header-setting needed.
app.get("/text-example", (req, res) => {
  res.send("Just plain text or HTML");
});

// res.json(data) — same result as res.send() with an object, but
// explicit about intent — prefer this when you KNOW you're sending JSON.
app.get("/json-example", (req, res) => {
  res.json({ name: "Rehan", role: "student" });
});

// res.status(code) — sets the HTTP status code. Returns the res
// object again, so you CHAIN another method directly onto it.
app.get("/not-found-example", (req, res) => {
  res.status(404).send("Nothing here");
});

// res.sendFile(absolutePath) — sends a file directly. NOTE: this is
// the method that caused the earlier NotFoundError crashes — its
// exact behavior differs between Express 4 and 5. fs.readFile +
// res.send() is a safer, more predictable alternative you already
// fully understand from Node core.
app.get("/file-example", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// res.redirect(url) — tells the browser to go to a different URL entirely
app.get("/old-page", (req, res) => {
  res.redirect("/about");
});


/* -----------------------------------------------------------------
   25e — app.use(middleware) — runs code on EVERY matching request
   Covered in full depth in section 28 below. Quick preview:
----------------------------------------------------------------- */
app.use(cors());          // 26 below
app.use(express.json());  // 27 below
app.use(express.static(path.join(__dirname, "static")));
// Built-in middleware — serves every file inside "static" automatically,
// no route needed per file.


/* -----------------------------------------------------------------
   25f — app.listen(port, callback) — actually starts the server
   Nothing above STARTS anything — it only configures the app.
   This line turns it on. Placed at the very end of this file.
----------------------------------------------------------------- */
// app.listen(port, () => { ... });   <- see bottom of file


/* =====================================================================
   26 — CORS (cross-origin fundamentals, preflight, cors middleware)
   ---------------------------------------------------------------
   WHAT "CROSS-ORIGIN" MEANS:
   Browsers block a webpage from one origin (localhost:5500) from
   making requests to a DIFFERENT origin (localhost:3000) by default —
   different port, domain, or protocol all count as different origins.
   This is a BROWSER security rule, not a Node/Express thing.

   PREFLIGHT (OPTIONS request):
   Before certain requests (a POST with JSON, custom headers), the
   browser AUTOMATICALLY sends a separate OPTIONS request FIRST,
   asking "are you okay receiving this from this origin?" Only if
   the server says yes does the browser send the real request.
   cors() middleware handles answering this for you automatically —
   you never write OPTIONS handling by hand.

   RAW HTTP FIX (manual, one header):
     res.setHeader("Access-Control-Allow-Origin", "*")

   EXPRESS FIX:
     npm install cors
     const cors = require("cors");
     app.use(cors());

   app.use(cors()) with NO arguments = allow ALL origins, fine for
   learning, not for production. Restrict to one frontend:
     app.use(cors({ origin: "http://localhost:5500" }))

   Must be placed BEFORE the routes it should protect.
===================================================================== */


/* =====================================================================
   27 — ROUTE PARAMS, QUERY PARAMS, BODY PARSING
   ---------------------------------------------------------------
   ROUTE PARAMS — dynamic segments in the URL path:
     app.get("/user/:id", (req, res) => res.send(req.params.id));
   ":id" is a named parameter, extracted automatically into
   req.params.id. "/user/123" -> req.params.id === "123"

   QUERY PARAMS — the part of a URL after "?":
     app.get("/search", (req, res) => res.send(req.query));
   "/search?q=backend" -> req.query === { q: "backend" }

   BODY PARSING — reading data sent in a POST/PUT body:
     app.use(express.json());
   Without this, req.body is undefined. Must be placed BEFORE any
   route reading req.body (already done above in section 25e).
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
   WHY IT EXISTS:
   Without a Router, every route sits in one file. Fine at 5 routes,
   unmanageable at 50. Router lets you split routes into separate
   files by feature, then plug them into the main app.


   router.get() works EXACTLY like app.get() — same signature, same
   behavior. The difference: router is NOT connected to anything
   until another file plugs it in. It's a self-contained, portable
   set of routes.

   -----------------------------------------------------------------
   STEP 2 — in the MAIN file (this file), import and MOUNT it:
   -----------------------------------------------------------------
     const blogRoutes = require("./routes/blog");
     app.use("/blog", blogRoutes);

   "MOUNTING" — the key concept:
   app.use("/blog", blogRoutes) means every route INSIDE blogRoutes
   gets "/blog" automatically prefixed onto it.
     router.get("/")     -> becomes reachable at  /blog/
     router.get("/:id")  -> becomes reachable at  /blog/5

   The router file itself never knows or cares about that "/blog"
   prefix — it just defines routes relative to ITSELF. The mount
   point (decided in the main file) is what places those routes
   somewhere in the full app. Same router file mounted at a
   different path would live somewhere else entirely:
     app.use("/api/posts", blogRoutes)
     -> router.get("/") now reachable at /api/posts/ instead

   -----------------------------------------------------------------
   WHY THIS MATTERS — the actual folder structure it produces:
   -----------------------------------------------------------------
     index.js          <- wires everything together, decides mount points
     routes/
       blog.js          <- only knows about blog-related routes
       users.js          <- (later) only knows about user-related routes

   Each file stays small and focused on ONE thing. This is the
   FIRST layer of the Controller-Service-Repository pattern —
   Router files are step one of that separation, splitting routing
   concerns out of business logic.
===================================================================== */

const blogRoutes = require("./routes/pages");
app.use("/blog", blogRoutes);


/* =====================================================================
   28 — CUSTOM + ERROR-HANDLING MIDDLEWARE — DEEP DIVE
   ---------------------------------------------------------------
   THE CORE SHAPE: every middleware function is (req, res, next).
   Express calls it BEFORE the matching route handler runs.

   -----------------------------------------------------------------
   28a — HOW next() CHAINS MIDDLEWARE TOGETHER
   -----------------------------------------------------------------
     app.use((req, res, next) => {
       console.log("middleware 1");
       next();
     });
     app.use((req, res, next) => {
       console.log("middleware 2");
       next();
     });
     app.get("/", (req, res) => {
       console.log("route handler");
       res.send("done");
     });
   Hitting "/" prints, in order: middleware 1, middleware 2,
   route handler. Each middleware calls next() to hand control to
   the next thing in line. The route handler is really just the
   LAST "middleware" in the chain — the one that sends a response
   instead of calling next().

   IF YOU FORGET next(): the request hangs FOREVER. The browser
   sits there loading, nothing ever responds — Express is waiting
   for permission to move on that never comes. Common early bug.

   -----------------------------------------------------------------
   28b — THREE KINDS OF MIDDLEWARE YOU'LL ACTUALLY USE
   -----------------------------------------------------------------

   1) APP-LEVEL, runs on EVERYTHING (no path given):
        app.use(express.static(path.join(__dirname, "static")));

   2) PATH-SCOPED, only runs for requests starting with a path:
        app.use("/admin", (req, res, next) => {
          console.log("someone hit an /admin route");
          next();
        });
      Only fires for /admin, /admin/settings, etc — not / or /about.

   3) ERROR-HANDLING — special shape, FOUR parameters not three:
        app.use((err, req, res, next) => {
          console.error(err.stack);
          res.status(500).send("Something broke");
        });
      Express recognizes this SPECIFICALLY by the 4-argument
      signature. Must be placed LAST — after every other route and
      middleware, including the 404 handler. When a route throws,
      Express skips ahead past all normal middleware/routes straight
      to this handler, instead of crashing the server or leaking a
      raw stack trace to the browser. (This is exactly what would
      have caught the earlier sendFile NotFoundError gracefully.)

   -----------------------------------------------------------------
   28c — ORDER MATTERS, GENUINELY
   -----------------------------------------------------------------
   Middleware runs TOP TO BOTTOM, in the order written with app.use().
   Putting express.static() AFTER your routes instead of before means
   requests hit your routes first and might never reach the static
   file check at all. Order is not optional in Express.
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


app.listen(port, () => {
  console.log(`server is running on port ${port}`);
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
   either never runs, runs too early, or breaks something silently.
===================================================================== */