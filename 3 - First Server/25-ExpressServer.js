/*
=====================================================================
 STEP 3 — ITEMS 25, 26, 27, 28, 29 — REVISION
 25: Express setup (app, routes, middleware)
 26: CORS (using the cors package)
 27: Route params, query params, body parsing
 28: Custom + error-handling middleware
 29: express.Router() for modular routes
=====================================================================
*/

require("dotenv").config();
const cors = require("cors");
const express = require("express");

const port = process.env.PORT || 3000;


/* =====================================================================
   ITEM 25 — EXPRESS SETUP: app, routes, middleware
   ---------------------------------------------------------------
     const app = express();
     -> creates the Express application. Replaces http.createServer.

     app.get(path, handler)
     -> registers a route that only responds to GET requests
        matching that exact path. Express does the URL matching
        automatically - no more manual if/else on req.url.
        Other verbs work the same way: app.post(), app.put(),
        app.delete().

     app.use(handler)
     -> registers MIDDLEWARE - a function that runs on every
        request, not tied to one specific path. Runs top to bottom
        in the order it's written in the file. If placed AFTER all
        routes, it only runs when nothing above it matched -
        making it a catch-all/404 handler.

     res.send(data)
     -> sends the response and ends it (Express's version of
        res.end()). Automatically sets the right Content-Type
        header based on what's passed - a string becomes
        text/html, an object becomes application/json, etc. No
        need to set headers manually like on a raw http server.

     app.listen(port, callback)
     -> starts the server, same job as server.listen() on raw http.

   IMPORTANT: route order matters. Express checks routes top to
   bottom and stops at the first match. A dynamic route like
   "/:name" placed BEFORE specific routes like "/about" will match
   "/about" first and swallow it - specific routes must always come
   before dynamic or catch-all routes.
===================================================================== */

const app = express();

app.use(cors());
// ITEM 26 - see below, placed early since it's middleware

app.use(express.json());
// ITEM 27 - see below, placed early since it's middleware


/* =====================================================================
   ITEM 26 — CORS (using the cors package)
   ---------------------------------------------------------------
   Browsers block cross-origin requests by default. On a raw http
   server, the fix is manually adding a header:
     res.setHeader("Access-Control-Allow-Origin", "*")
   In Express, the "cors" package does this automatically as
   middleware:

     npm install cors

     const cors = require("cors");
     app.use(cors());

   app.use(cors()) with no arguments allows requests from ALL
   origins - fine for learning/development. To restrict it to one
   specific frontend:
     app.use(cors({ origin: "http://localhost:5500" }))

   Must be placed BEFORE the routes it should protect, same
   ordering rule as any other middleware.
===================================================================== */


/* =====================================================================
   ITEM 27 — ROUTE PARAMS, QUERY PARAMS, BODY PARSING
   ---------------------------------------------------------------
   ROUTE PARAMS (dynamic segments in the URL path):
     app.get("/user/:id", (req, res) => {
       res.send(req.params.id);
     });
   ":id" defines a named parameter. Express extracts it
   automatically into req.params.id - no manual string splitting
   needed. Visiting "/user/123" makes req.params.id equal "123".

   QUERY PARAMS (the part of a URL after "?"):
     app.get("/search", (req, res) => {
       res.send(req.query);
     });
   Express automatically parses everything after "?" into
   req.query as an object. Visiting "/search?q=backend" makes
   req.query equal { q: "backend" }.

   BODY PARSING (reading data sent in a POST/PUT request body):
     app.use(express.json());
   This middleware tells Express: "if a request has a JSON body,
   parse it and put the result on req.body." Without this line,
   req.body is undefined. Must be added before any route that
   reads req.body.

     app.post("/feedback", (req, res) => {
       res.send(req.body);
     });
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
   ITEM 29 — express.Router() FOR MODULAR ROUTES
   ---------------------------------------------------------------
   Splitting routes into separate files by feature, then plugging
   them into the main app. Purely organizational - behavior does
   not change.

   In a separate file, e.g. routes/pages.js:

     const express = require("express");
     const router = express.Router();

     router.get("/about", (req, res) => {
       res.send("about page");
     });

     module.exports = router;

   router.get() works exactly like app.get(), just on a Router
   object instead of the main app. module.exports makes it
   importable elsewhere.

   In the main server file:

     const pageRoutes = require("./routes/pages");
     app.use("/", pageRoutes);

   app.use("/", pageRoutes) mounts the whole router at "/" -
   meaning every route inside pages.js keeps its original path
   ("/about" stays "/about", not "/pages/about"). Mounting at a
   different base path, e.g. app.use("/api", pageRoutes), would
   prefix every route inside with "/api".
===================================================================== */

const pageRoutes = require("./routes/pages");
app.use("/", pageRoutes);


/* =====================================================================
   ITEM 28 — CUSTOM + ERROR-HANDLING MIDDLEWARE
   ---------------------------------------------------------------
   CUSTOM MIDDLEWARE (e.g. logging every request):

     app.use((req, res, next) => {
       console.log(`${req.method} ${req.url}`);
       next();
     });

   Every middleware function receives a third parameter, "next".
   Calling next() tells Express "I'm done, move on to whatever
   comes after me." Forgetting to call next() makes the request
   hang forever - nothing else runs, no response ever gets sent.

   Placement matters: logging middleware should sit near the top,
   before routes, so it runs on every request.

   ERROR-HANDLING MIDDLEWARE:

     app.use((err, req, res, next) => {
       console.error(err.message);
       res.status(500).send("Something went wrong");
     });

   Recognized by Express specifically because it has EXACTLY 4
   parameters (err, req, res, next) instead of the usual 3. Must be
   placed LAST - after every other route and middleware, including
   the 404 handler. When a route throws an error, Express skips
   ahead past all normal middleware/routes and runs this handler
   instead of crashing the whole server or leaking a raw stack
   trace to the user.

   res.status(500).send(...) is Express's chained shorthand for
   what raw http required as two separate lines:
     res.statusCode = 500;
     res.end(...);
===================================================================== */

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/broken", (req, res) => {
  throw new Error("something broke on purpose");
});

app.use((req, res) => {
  res.status(404).send("<p>404 Page not found</p>");
});

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
   1. cors()              -> must run before routes, adds CORS header
   2. express.json()      -> must run before routes that read req.body
   3. logging middleware   -> runs before routes, logs every request
   4. page routes (Router) -> specific routes first
   5. other specific routes (/user/:id, /search, /broken, /feedback)
   6. 404 catch-all app.use() -> only reached if nothing above matched
   7. error handler (4 params) -> only reached when something throws

   Express checks top to bottom. Anything placed out of this order
   either never runs, runs too early, or breaks something else
   silently - order is not optional in Express middleware.
===================================================================== */