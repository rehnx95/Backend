# Step 3 — Building Your First Server — Explain-It-Out-Loud Guide

Same format as before: plain explanation, why it matters, tiny example, and a line you can say out loud. A few examples point back at your Depot project since you've already got a real Express app running.

---

### 22. Server with Node's Raw `http` Module (No Framework)

**Simple explanation:** Before Express, there's just Node's built-in `http` module. You give it a single callback function that runs for *every* incoming request, and you're responsible for everything — checking the URL, the method, writing the response yourself.

```js
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello world");
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(3000, () => console.log("listening on 3000"));
```

**Why it matters:** Express isn't magic — it's a layer on top of exactly this. Every route you register with `app.get(...)` eventually funnels through one function like this, with routing/parsing/middleware handled for you.

Say it like this: *"`http.createServer` gives you one raw callback for every request. Express is built on top of that — it just adds routing, middleware, and parsing so you don't hand-roll `if (req.url === ...)` chains yourself."*

---

### 23. `req`/`res` Objects, Headers, Streaming a Response

**Simple explanation:**
- **`req`** (IncomingMessage) — a **Readable stream**. It has `req.url`, `req.method`, `req.headers`, and the request body arrives as chunks over time (that's *why* you need a body parser — the body isn't just sitting there as a property, you have to read the stream).
- **`res`** (ServerResponse) — a **Writable stream**. You can `res.write()` multiple times before `res.end()` — that's what "streaming a response" means: sending data in pieces instead of building the whole thing in memory first.

```js
// reading a request body manually (this is what body-parser automates)
let body = "";
req.on("data", (chunk) => { body += chunk; });
req.on("end", () => { console.log(JSON.parse(body)); });

// streaming a response
res.writeHead(200, { "Content-Type": "text/plain" });
res.write("first chunk...");
res.write("second chunk...");
res.end();
```

Say it like this: *"`req` and `res` are both streams — `req` is readable (the body arrives as `data` events), `res` is writable (you can `write()` to it in pieces before you `end()` it). Setting headers has to happen before you start writing the body — once bytes go out, headers are locked in."*

---

### 24. Environment Variables — `.env` and `process.env`

**Simple explanation:** Config and secrets (DB passwords, JWT secrets, API keys) don't belong in your source code — they change per environment (local vs. production) and should never be committed to git. `.env` is a plain-text file of `KEY=value` pairs; the `dotenv` package reads it into `process.env` at startup.

Your own `db.js` and `middleware/authenticateToken.js` both do exactly this:

```js
require("dotenv").config();
// now process.env.DB_HOST, process.env.JWT_SECRET, etc. are available
```

**Why it matters:** If you hardcode a DB password into a file and push to GitHub, it's compromised — permanently, even if you delete it later (git history). `.env` should always be in `.gitignore`.

Say it like this: *"Never hardcode credentials — `.env` holds them locally, `dotenv` loads them into `process.env`, and in production the hosting platform (Render, etc.) sets those same variables directly, no file needed."*

---

### 25. Express Setup — `app`, Routes, Middleware

**Simple explanation:** Express wraps Node's raw `http` server with three core ideas:

- **`app`** — the application instance, built with `express()`
- **Routes** — `app.get(path, handler)`, `app.post(...)`, etc. — map an HTTP method + path to a function
- **Middleware** — functions that run *in between* the request arriving and the final route handler, each one calling `next()` to pass control along

```js
const express = require("express");
const app = express();

app.use(express.json());          // middleware: parses JSON bodies
app.get("/health", (req, res) => res.send("ok")); // route

app.listen(7000);
```

This is literally your `app.js` — `app.use(cors())`, `app.use(express.json())`, then dozens of `app.get/post/patch/delete(...)` calls.

Say it like this: *"`app` is the whole application. Every request runs through a chain of middleware — CORS, JSON parsing, auth — before it ever reaches the route handler that actually does the work."*

---

### 26. CORS — Cross-Origin Fundamentals, Preflight, Configuring the Middleware

**Simple explanation:** Browsers block a page on `siteA.com` from making requests to `siteB.com` by default — that's the **Same-Origin Policy**. CORS is the mechanism that lets a server explicitly say "actually, requests from this other origin are allowed."

**Preflight (OPTIONS):** For "non-simple" requests — anything with a custom header like `Authorization`, or methods like `PATCH`/`DELETE` — the browser automatically sends an `OPTIONS` request *first*, asking "am I allowed to do this?" before sending the real request. The server has to respond to that OPTIONS request with the right `Access-Control-Allow-*` headers, or the browser never sends the real one.

```js
const cors = require("cors");
app.use(cors()); // your current setup: allows ALL origins, all methods

// tighter version:
app.use(cors({
  origin: "https://yourfrontend.com",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

Since your Depot frontend and backend are served from the *same origin* (`express.static` serving `frontend/` from the same Express app), you likely don't strictly need CORS at all right now — it only matters once a frontend on a different domain/port calls this API.

Say it like this: *"CORS isn't a security feature the server needs for itself — it's the server telling *browsers* which other origins are allowed to read the response. For anything beyond a plain GET, the browser sends a preflight `OPTIONS` request first to check permissions before sending the real one."*

---

### 27. Route Params, Query Params, Body Parsing

**Simple explanation:** Three different places data can travel into a request.

```js
// route param — part of the URL path itself, required, identifies a resource
app.get("/tasks/:task_id", (req, res) => {
  req.params.task_id
});

// query param — after the ?, optional, usually for filtering/pagination
app.get("/tasks", (req, res) => {
  req.query.page   // /tasks?page=2&limit=10
  req.query.limit
});

// body — the payload of POST/PATCH/PUT, needs a parser middleware to read it
app.post("/tasks", (req, res) => {
  req.body.title   // requires app.use(express.json()) to exist
});
```

Your own `taskControllers.js` uses all three: `:task_id` as a param, `page`/`limit` as query params in `getTaskByUser`, and `req.body` (validated through Zod) in `createTask`.

Say it like this: *"Params identify *which* resource — required, part of the path. Query params filter or paginate — optional, after the `?`. Body carries the actual data being created or changed, and you need `express.json()` middleware or it stays an unparsed stream."*

---

### 28. Custom + Error-Handling Middleware

**Simple explanation:** Any middleware is just `(req, res, next) => {...}`. What makes it an **error-handling** middleware specifically is having **four** parameters: `(err, req, res, next)`. Express detects the arity (parameter count) and only routes errors to those.

```js
// custom middleware — e.g. logging, or your authenticateToken.js
function logger(req, res, next) {
  console.log(req.method, req.url);
  next(); // MUST call next(), or the request hangs forever
}
app.use(logger);

// error-handling middleware — must be registered LAST, after all routes
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, error: "Something went wrong" });
});
```

This is exactly the last block in your `app.js`. And your `asyncHandler.js` utility exists because Express *doesn't* automatically catch rejected promises from `async` route handlers — without it, a thrown error inside `async function createTask(req, res)` would crash silently instead of reaching your error handler. `asyncHandler` wraps the handler and does `.catch(next)` for you, forwarding any error into that final middleware.

Say it like this: *"Regular middleware takes three args and must call `next()` to pass control along. Error middleware takes four args — Express recognizes that shape specifically — and has to be registered last, after every route, so it catches anything that got passed to `next(err)`."*

---

### 29. `express.Router()` for Modular Routes

**Simple explanation:** Instead of registering every route directly on `app`, `Router()` lets you group related routes into their own file/module, then mount that whole group under a path prefix.

```js
// routes/tasks.js
const router = require("express").Router();
router.get("/", taskControllers.getTaskByUser);
router.get("/:task_id", taskControllers.getOneTask);
module.exports = router;

// app.js
app.use("/tasks", require("./routes/tasks"));
// now GET /tasks and GET /tasks/:task_id both work
```

**Why it matters:** Your current `app.js` registers every single route flat, in one 250-line file. `Router()` is the natural next step — it would let you split that into `routes/users.js`, `routes/tasks.js`, `routes/projects.js`, etc., each only knowing about its own resource. It's optional, purely organizational — behaves identically either way.

Say it like this: *"`Router()` is a mini-app you can mount at a path prefix. It's how you break a giant flat route file into one file per resource without changing any behavior — just organization."*

---

### 30. TypeScript Setup — `tsc` vs `ts-node`/`tsx`

**Simple explanation:** Node can't run `.ts` files directly — TypeScript has to become plain JavaScript first. Two approaches:

- **`tsc` (compile-then-run)** — TypeScript's own compiler. You run `tsc` to output `.js` files into a `dist/` folder, then run those with plain `node dist/app.js`. This is the standard production approach — compile once, run the compiled output.
- **`ts-node` / `tsx` (run directly, dev only)** — compiles in-memory on the fly, so you can run `ts-node app.ts` or `tsx app.ts` directly without a separate build step. Much faster iteration for development; `tsx` in particular is a faster, more modern alternative to `ts-node`, built on esbuild.

Minimal setup:

```bash
npm install -D typescript tsx
npx tsc --init          # creates tsconfig.json
```

```json
// package.json
"scripts": {
  "dev": "tsx watch app.ts",
  "build": "tsc",
  "start": "node dist/app.js"
}
```

**Why it matters for a project like yours:** TypeScript would catch a huge chunk of the bug categories in your own `mistakes.js` at compile time instead of runtime — schema/column name drift, undefined variables, wrong function names, missing `await` on typed Promises. It's optional, but it's the single highest-leverage tool against exactly the mistake patterns you've been logging.

Say it like this: *"`tsc` compiles TypeScript to JavaScript ahead of time — that's what you actually deploy and run. `ts-node`/`tsx` skip that step for local development by compiling on the fly, so you get instant feedback without a separate build every time you save."*

---

## Quick recall drill

22. **Raw `http`** — one callback for every request, you handle routing/parsing yourself
23. **req/res** — req is a readable stream (body arrives in chunks), res is writable (stream out in pieces)
24. **`.env`** — secrets stay out of source code, loaded into `process.env` via `dotenv`
25. **Express** — `app` + routes + middleware chain, sitting on top of raw `http`
26. **CORS** — server tells *browsers* which origins may read the response; preflight `OPTIONS` checks first for non-simple requests
27. **params vs query vs body** — path identity / optional filters / payload data (needs `express.json()`)
28. **Middleware** — 3 args = normal (must call `next()`); 4 args = error handler (must be last)
29. **`Router()`** — mountable mini-app, splits one flat route file into per-resource modules
30. **TypeScript** — `tsc` compiles ahead-of-time for production; `ts-node`/`tsx` compile on the fly for dev