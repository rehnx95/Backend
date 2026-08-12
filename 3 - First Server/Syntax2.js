/*
=====================================================================
 COMPLETE BACKEND SYNTAX REFERENCE — NODE + EXPRESS
 Everything learned so far, in the actual order it was learned.
 One file, no duplication. Read top to bottom for revision.

 9.  What Node is (V8, libuv) + Node identity syntax
 10. npm, package.json, semver
 11. Event loop phases (including Promise.then placement)
 12. fs, path, process, os modules (full)
 13. Buffers & Streams (read + write side)
 14. EventEmitter (on/emit/once/off, extending in a class)
 --- CommonJS vs ES Modules ---
 22. Raw http module (no framework)
 23. req/res on raw http, manual route matching
 24. Environment variables (dotenv)
 25. Express setup — app, all core methods
 26. CORS — cross-origin fundamentals, preflight
 27. Route params, query params, body parsing
 28. Custom + error-handling middleware (deep dive)
 29. express.Router() for modular routes (deep dive)
=====================================================================
*/


// ============================================================
// 9 — WHAT NODE IS — V8 & libuv
// ============================================================

// PROBLEM: JavaScript was built in 1995 to run ONLY inside browsers.
// It could click buttons, change HTML — but it could NEVER read a file,
// open a network connection, or talk to your OS. Browsers block that
// on purpose, for security.

// NODE'S FIX (2009): take Chrome's JS engine, glue it to a layer that
// CAN talk to the OS. Now the same JS language can run OUTSIDE the
// browser, on a server, with real file/network access.

// Node = TWO PARTS glued together:

// V8 — Google's JS engine (same one Chrome uses). Takes your JS code,
// turns it into machine code, runs it. Understands closures, promises,
// `this` — everything from Namaste JS. V8 alone has NO idea what a
// file or network is.

// libuv — a C library Node adds NEXT TO V8. Actually talks to the OS:
// reading files, opening network sockets, timers. Also runs the
// EVENT LOOP.

// EXAMPLE — this single snippet touches both parts:
const fs = require("fs");

fs.readFile(__filename, "utf8", (err, data) => {
  // V8 runs this callback. libuv is the one that went to disk,
  // read the file in the BACKGROUND, and called V8 back once done.
  console.log("File read finished");
});
console.log("This prints FIRST — V8 kept running while libuv worked");

// WHY THIS MATTERS: libuv handles slow I/O off to the side, so V8's
// single thread never freezes waiting for disk/network. Same model
// as the browser event loop:
//   Browser:  setTimeout -> Web API -> callback queue -> event loop
//   Node:     fs.readFile -> libuv  -> callback queue -> event loop

// Node identity syntax:
process.version;          // "v20.11.0" style string
process.versions;         // object: node, v8, npm, etc. all together
console.log(globalThis);  // Node's version of "window" — universal global


// ============================================================
// 10 — npm, package.json, semver
// ============================================================

// npm init          -> interactive prompts
// npm init -y        -> accepts all defaults instantly

// npm install express              -> saves to "dependencies"
// npm install nodemon --save-dev   -> saves to "devDependencies"
// npm install -g nodemon            -> installs globally, not project-local

// package.json fields you'll actually edit:
// {
//   "name": "my-app",
//   "version": "1.0.0",
//   "main": "index.js",
//   "scripts": {
//     "start": "node index.js",
//     "dev": "nodemon index.js"
//   },
//   "dependencies": { "express": "^4.18.2" },
//   "devDependencies": { "nodemon": "^3.0.1" }
// }
// scripts        -> shortcuts, run via `npm run <name>`
// dependencies    -> packages your app NEEDS to run
// devDependencies -> packages only needed while developing

// npm run dev
// npm start          -> "start" is special, runs WITHOUT needing "run"

// package-lock.json — pins the EXACT version of every package in
// the full dependency tree (not just what you directly installed),
// so `npm install` gives identical results on any machine.

// semver ranges — how version numbers in package.json are read:
// MAJOR.MINOR.PATCH  e.g. 4.18.2
//   MAJOR -> breaking changes
//   MINOR -> new features, nothing breaks
//   PATCH -> bug fixes only
// "^4.18.2"  -> compatible with 4.x.x, allows minor/patch updates (default)
// "~4.18.2"  -> allows only patch updates (4.18.x)
// "4.18.2"   -> exact version only
// "*"        -> any version (rarely used, risky)

// node_modules is always regenerable from package.json + lockfile —
// always goes in .gitignore, never committed.


// ============================================================
// 11 — NODE'S EVENT LOOP PHASES
// ============================================================

// Phase order, repeating in sequence:
//   timers -> pending callbacks -> poll -> check -> close callbacks
// timers -> setTimeout/setInterval callbacks whose time is up
// poll    -> I/O callbacks (like fs.readFile finishing)
// check   -> setImmediate callbacks

// RULE 1: synchronous code ALWAYS runs first, completely, before
// anything async — no exceptions.

// RULE 2: process.nextTick() jumps EVERYTHING. Doesn't belong to any
// phase — runs right after the current operation finishes, before
// the event loop even continues.

// RULE 3 (the missing piece): Promise.then() callbacks are ALSO
// "microtasks" — same priority tier as process.nextTick(), meaning
// they too jump ahead of timers/setImmediate. nextTick specifically
// runs slightly before Promise.then() when both are queued together.

// FULL real order, from synchronous code outward:
//   1. synchronous code first
//   2. process.nextTick() callbacks
//   3. Promise .then() callbacks (microtask queue)
//   4. setTimeout/setInterval callbacks (timers phase)
//   5. setImmediate() callbacks (check phase)

setTimeout(() => console.log("timers phase"), 0);
setImmediate(() => console.log("check phase"));
process.nextTick(() => console.log("runs before other microtasks"));
Promise.resolve().then(() => console.log("microtask queue"));

// RULE 4: setTimeout vs setImmediate order is NOT GUARANTEED at the
// top level of a script — don't write code depending on it.

// RULE 5: INSIDE an I/O callback, the order IS guaranteed —
// setImmediate ALWAYS wins over setTimeout. Why: after I/O finishes
// you're sitting in the "poll" phase. The very next phase is "check"
// (setImmediate) — timers requires looping all the way back around.
fs.readFile(__filename, () => {
  setTimeout(() => console.log("loses — requires full loop back"), 0);
  setImmediate(() => console.log("always wins — next phase after poll"));
});


// ============================================================
// 12 — fs, path, process, os MODULES
// ============================================================

const path = require("path");
const os = require("os");

// --- path — builds path STRINGS, never touches disk ---
path.join(__dirname, "folder", "file.txt"); // glues pieces, correct OS slash
path.resolve("file.txt");
// -> ABSOLUTE path based on where you RAN the command from
//    (like process.cwd() + your input) — DIFFERENT from path.join,
//    which just glues pieces together regardless of cwd
path.basename("/a/b/file.txt"); // "file.txt"
path.dirname("/a/b/file.txt");  // "/a/b"
path.extname("file.txt");       // ".txt"
path.parse("/a/b/file.txt");
// -> { root: '/', dir: '/a/b', base: 'file.txt', ext: '.txt', name: 'file' }
// breaks a path into ALL its pieces at once

// __dirname and __filename — available automatically in CommonJS files
console.log(__dirname);   // absolute path of the current file's folder
console.log(__filename);  // absolute path of the current file itself


// --- fs — this is where DISK is actually touched ---

// 1) SYNC — blocks, waits, simple, freezes everything else while running
fs.readFileSync("file.txt", "utf8");
fs.writeFileSync("file.txt", "some content");
fs.appendFileSync("file.txt", "more content");
fs.existsSync("file.txt"); // boolean

// 2) CALLBACK — non-blocking. Starts the task, keeps going, comes BACK
// to run your function once disk work finishes (handled by libuv).
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});
fs.writeFile("file.txt", "content", (err) => {
  if (err) throw err;
});

// 3) PROMISE-BASED — same non-blocking behavior, async/await syntax
const fsPromises = require("fs/promises");
async function readWithPromises() {
  const data = await fsPromises.readFile("file.txt", "utf8");
  console.log(data);
}

// directory operations
fs.mkdirSync("newFolder");
fs.readdirSync(".");                        // lists files in a directory
fs.rmSync("file.txt");                      // deletes a single file
fs.rmSync("folder", { recursive: true });   // deletes a folder + everything inside


// --- process — a NODE GLOBAL, info about the running program ---
process.env.PORT;          // reading an environment variable
process.env.NODE_ENV;      // common one: "development" / "production"
process.argv;              // array of command-line arguments
process.cwd();
// folder you were STANDING IN ON THE TERMINAL when you ran `node file.js`
// DIFFERENT from __dirname (always the file's own folder, fixed)
process.exit(0);           // exits the program. 0 = success, 1 = error
process.on("exit", (code) => {
  console.log("exiting with", code);
  // runs right before the process actually closes — useful for cleanup
});


// --- os — system info, rarely used in normal app code ---
os.platform();  // "linux", "win32", "darwin"
os.cpus();      // array of CPU core info
os.totalmem();  // total system memory in bytes
os.freemem();   // free system memory in bytes
os.homedir();   // current user's home directory


// ============================================================
// 13 — BUFFERS & STREAMS
// ============================================================

// --- Buffers — raw bytes, not text ---
const buf1 = Buffer.from("hello");   // from a string
const buf2 = Buffer.alloc(10);       // 10 bytes, all zeroed (fill in later)
const buf3 = Buffer.from([1, 2, 3]); // directly from byte values as numbers

buf1.toString();          // decode back to a string, "hello"
buf1.toString("utf8");    // explicit encoding
buf1.length;                // number of bytes

// WHY BUFFERS EXIST: when Node reads a file WITHOUT an encoding, you
// get raw bytes, not text — Node has no idea if the file is text, an
// image, or video. Specifying 'utf8' tells Node to decode it as text.


// --- Streams — reading/writing data in small PIECES, not all at once ---
// PROBLEM: readFileSync loads the ENTIRE file into memory at once —
// fine for small files, would crash on a multi-GB file.

// readable stream — reading a file in chunks
const readStream = fs.createReadStream("bigfile.txt", { encoding: "utf8" });
readStream.on("data", (chunk) => {
  console.log("received chunk:", chunk.length);
  // 64KB (65536 chars) is Node's DEFAULT chunk size for read streams —
  // memory usage stays flat no matter how big the real file is
});
readStream.on("end", () => {
  console.log("done reading");
});
readStream.on("error", (err) => {
  console.log("error:", err);
});
// .on() here IS EventEmitter syntax — streams are built ON TOP OF
// EventEmitter internally (see section 14 below).

// writable stream — writing data OUT in chunks
const writeStream = fs.createWriteStream("output.txt");
writeStream.write("first chunk\n");   // .write() can be called MULTIPLE
writeStream.write("second chunk\n");  // times, each call sends one more chunk
writeStream.end();
// REQUIRED — signals "no more data coming." Without this, the file
// may never properly close/finish.

// piping — connect a readable stream directly to a writable one,
// automating the "read chunk -> write chunk -> repeat" loop yourself
const readS = fs.createReadStream("input.txt");
const writeS = fs.createWriteStream("output.txt");
readS.pipe(writeS);
// This is the pattern used in real code — e.g. streaming a file
// straight into an HTTP response in Express, later.


// ============================================================
// 14 — EventEmitter
// ============================================================

const EventEmitter = require("events");
const emitter = new EventEmitter();

// .on(eventName, callback) — REGISTER a listener. Does NOT run yet,
// just says "when this event happens, run this function."
emitter.on("greet", (name) => {
  console.log("Hello, " + name);
});

// .emit(eventName, data) — ANNOUNCE the event actually happened.
// THIS triggers every registered listener, SYNCHRONOUSLY, immediately,
// in the order they were registered. No queue, no waiting — a direct
// function call, unlike setTimeout/fs callbacks.
emitter.emit("greet", "Rehan");

// .once(eventName, callback) — like .on(), but the listener is
// AUTOMATICALLY removed after firing ONE time. Good for "startup" or
// "first connection" type events.
emitter.once("startup", () => {
  console.log("runs only the first time this fires");
});

// removing a listener you no longer want:
function handler() {
  console.log("handled");
}
emitter.on("event", handler);
emitter.off("event", handler);
// (emitter.removeListener(...) does the exact same thing — .off() is
// just the shorter, newer name)

// EXTENDING EventEmitter in a class — a real-world pattern: instead
// of a plain emitter, a CLASS IS an emitter, with your own methods
// added on top.
class MyService extends EventEmitter {
  doSomething() {
    this.emit("done", "result data");
  }
}
const service = new MyService();
service.on("done", (result) => console.log(result));
service.doSomething();
// Shows up constantly later — e.g. a DB connection class emitting
// 'connected' / 'error' / 'disconnected' events.

// WHY THIS MATTERS LATER: app.get() in Express (below) is this exact
// same shape — "when X happens, run this" — just wearing different
// clothes.


/* =====================================================================
   MODULES — CommonJS vs ES Modules
   ---------------------------------------------------------------
   Every file so far has used CommonJS — Node's ORIGINAL, DEFAULT
   module system:
     require('fs')             -> import
     module.exports = {...}    -> export

   ES Modules (import/export) is the MODERN, browser-matching system.
   Turned on via package.json: { "type": "module" }. Cannot mix
   require() and import in the same file.

     export function add(a, b) { return a + b; }     // exporting
     import { add } from './math.js';                 // importing,
                                                          // extension REQUIRED

   Key differences:
   - require() is SYNCHRONOUS (blocking). import is asynchronous
     under the hood — this is why ESM supports top-level await.
   - __dirname/__filename exist ONLY in CommonJS, not in ESM.
   - CommonJS's require('./math') does NOT need the file extension;
     ESM's import path REQUIRES it.

   WHICH TO USE RIGHT NOW: keep using CommonJS — it's what this
   roadmap, Express examples, and most tutorials still assume.
   Recognize import/export when you see it elsewhere, but no need
   to switch your own projects yet.
===================================================================== */


// ============================================================
// 22 — RAW http MODULE, NO FRAMEWORK
// ============================================================

const http = require("http");

const server = http.createServer((req, res) => {
  // runs on EVERY incoming request
});

server.listen(3000, () => console.log("running"));

// listening on a SPECIFIC network interface, not just localhost —
// this is what let another device on the same WiFi reach the server
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


/* =====================================================================
   25 — EXPRESS SETUP: app, routes, middleware, all core methods
===================================================================== */

const cors = require("cors");
const express = require("express");
const app = express();

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
      (This is exactly what would have caught the earlier sendFile
      NotFoundError gracefully.)

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
   either never runs, runs too early, or breaks something silently —
   order is not optional in Express middleware.
===================================================================== */