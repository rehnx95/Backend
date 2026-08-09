
// ===== 9. WHAT NODE IS — practical syntax touchpoints =====

// 9.1 checking Node/npm versions from code
process.version;          // "v20.11.0" style string
process.versions.node;    // just the node number
process.versions;         // object: node, v8, npm, etc. all together

// 9.2 the global object in Node (not "window" like browsers)
console.log(globalThis);  // universal, works in Node and browser


// ===== 10. npm / package.json / semver =====

// 10.1 initializing a project
// npm init          -> interactive prompts
// npm init -y        -> accepts all defaults instantly

// 10.2 installing packages
// npm install express          -> saves to "dependencies"
// npm install nodemon --save-dev  -> saves to "devDependencies"
// npm install -g nodemon        -> installs globally, not project-local

// 10.3 package.json structure (the fields you'll actually edit)
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

// 10.4 running a defined script
// npm run dev
// npm start          -> "start" is special, doesn't need "run"

// 10.5 semver ranges (how version numbers in package.json are read)
// "^4.18.2"  -> compatible with 4.x.x, allows minor/patch updates
// "~4.18.2"  -> allows only patch updates (4.18.x)
// "4.18.2"   -> exact version only
// "*"        -> any version (rarely used, risky)


// ===== 11. NODE'S EVENT LOOP PHASES — inspecting/scheduling syntax =====

// 11.1 scheduling into different phases
setTimeout(() => console.log("timers phase"), 0);
setImmediate(() => console.log("check phase"));
process.nextTick(() => console.log("runs before other microtasks"));
Promise.resolve().then(() => console.log("microtask queue"));

// 11.2 order these typically run in from synchronous code:
// 1. synchronous code first
// 2. process.nextTick() callbacks
// 3. Promise .then() callbacks (microtasks)
// 4. setTimeout/setInterval callbacks (timers phase)
// 5. setImmediate() callbacks (check phase)


// ===== 12. fs, path, process, os MODULES =====

const fs = require("fs");
const path = require("path");
const os = require("os");

// 12.1 fs — synchronous file reads/writes
fs.readFileSync("file.txt", "utf8");
fs.writeFileSync("file.txt", "some content");
fs.appendFileSync("file.txt", "more content");
fs.existsSync("file.txt"); // boolean

// 12.2 fs — asynchronous, callback-style
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});
fs.writeFile("file.txt", "content", (err) => {
  if (err) throw err;
});

// 12.3 fs — promise-based (modern, works with async/await)
const fsPromises = require("fs/promises");
async function readWithPromises() {
  const data = await fsPromises.readFile("file.txt", "utf8");
  console.log(data);
}

// 12.4 fs — directory operations
fs.mkdirSync("newFolder");
fs.readdirSync("."); // lists files in current directory
fs.rmSync("file.txt"); // deletes a file
fs.rmSync("folder", { recursive: true }); // deletes a folder + contents

// 12.5 path — building and inspecting paths
path.join(__dirname, "folder", "file.txt"); // safe path joining
path.resolve("file.txt"); // absolute path from current working dir
path.basename("/a/b/file.txt"); // "file.txt"
path.dirname("/a/b/file.txt"); // "/a/b"
path.extname("file.txt"); // ".txt"
path.parse("/a/b/file.txt"); // { root, dir, base, ext, name }

// 12.6 __dirname and __filename — available in CommonJS files automatically
console.log(__dirname);  // absolute path of the current file's folder
console.log(__filename); // absolute path of the current file

// 12.7 process — environment and runtime info
process.env.PORT;         // reading an env variable
process.env.NODE_ENV;     // common one: "development" / "production"
process.argv;             // array of command-line arguments
process.cwd();             // current working directory
process.exit(0);           // exits the program, 0 = success, 1 = error
process.on("exit", (code) => console.log("exiting with", code));

// 12.8 os — system information
os.platform();  // "linux", "win32", "darwin"
os.cpus();      // array of CPU core info
os.totalmem();  // total system memory in bytes
os.freemem();   // free system memory in bytes
os.homedir();   // current user's home directory


// ===== 13. BUFFERS & STREAMS =====

// 13.1 creating buffers
const buf1 = Buffer.from("hello"); // from a string
const buf2 = Buffer.alloc(10);     // 10 bytes, all zeroed
const buf3 = Buffer.from([1, 2, 3]); // from an array of bytes

// 13.2 reading/converting buffers
buf1.toString();          // back to a string, "hello"
buf1.toString("utf8");    // explicit encoding
buf1.length;               // number of bytes

// 13.3 readable stream — reading a file in chunks instead of all at once
const readStream = fs.createReadStream("bigfile.txt", "utf8");
readStream.on("data", (chunk) => {
  console.log("received chunk:", chunk);
});
readStream.on("end", () => {
  console.log("done reading");
});
readStream.on("error", (err) => {
  console.log("error:", err);
});

// 13.4 writable stream — writing data in chunks
const writeStream = fs.createWriteStream("output.txt");
writeStream.write("first chunk\n");
writeStream.write("second chunk\n");
writeStream.end(); // signals no more data will be written

// 13.5 piping — connect a readable stream directly to a writable one
const readS = fs.createReadStream("input.txt");
const writeS = fs.createWriteStream("output.txt");
readS.pipe(writeS);


// ===== 14. EventEmitter =====

const EventEmitter = require("events");

// 14.1 creating an emitter
const emitter = new EventEmitter();

// 14.2 listening for an event
emitter.on("greet", (name) => {
  console.log("Hello, " + name);
});

// 14.3 emitting (triggering) an event
emitter.emit("greet", "Rehan");

// 14.4 listening only once
emitter.once("startup", () => {
  console.log("runs only the first time this fires");
});

// 14.5 removing a listener
function handler() {
  console.log("handled");
}
emitter.on("event", handler);
emitter.off("event", handler); // or emitter.removeListener("event", handler)

// 14.6 extending EventEmitter in a class (common real-world pattern)
class MyService extends EventEmitter {
  doSomething() {
    this.emit("done", "result data");
  }
}
const service = new MyService();
service.on("done", (result) => console.log(result));
service.doSomething();

// ===== 22. RAW http MODULE, NO FRAMEWORK =====

const http = require("http");

// 22.1 creating and starting a server
const server = http.createServer((req, res) => {
  // runs on every request
});
server.listen(3000, () => console.log("running"));
server.listen(3000, "0.0.0.0", () => console.log("running"));


// ===== 23. req/res OBJECTS, HEADERS, RESPONSES =====

// 23.1 reading the request
// req.url            -> "/about"
// req.method         -> "GET"
// req.headers        -> object of all headers

// 23.2 setting response headers
// res.setHeader("Content-Type", "text/html");
// res.setHeader("Cache-Control", "max-age=10");
// res.setHeader("ETag", '"some-etag"');

// 23.3 setting status code
// res.statusCode = 200;
// res.statusCode = 404;

// 23.4 sending a response
// res.end(data)
// res.end()
// res.end("plain string")
// res.end(JSON.stringify(obj))

// 23.5 manual route matching by string splitting (raw http only)
const id = "/user/123".split("/user/")[1];       // "123"
const queryString = "/search?q=backend".split("?")[1]; // "q=backend"
"/user/123".startsWith("/user/");                  // true
Number("123");                                       // 123


// ===== 24. ENVIRONMENT VARIABLES (dotenv) =====

// 24.1 loading .env — must be the first line in the entry file
require("dotenv").config();

// 24.2 reading a value, with fallback
const port = process.env.PORT || 3000;

// 24.3 reading without a fallback
const dbUrl = process.env.DATABASE_URL;


// ===== 25. EXPRESS SETUP: app, routes, middleware =====

const express = require("express");
const app = express();

// 25.1 starting the server
app.listen(3000, () => console.log("running"));
app.listen(process.env.PORT || 3000, () => console.log("running"));

// 25.2 basic routes, one per HTTP method
app.get("/about", (req, res) => {});
app.post("/feedback", (req, res) => {});
app.put("/update", (req, res) => {});
app.delete("/remove", (req, res) => {});

// 25.3 sending a response
// res.send(data)
// res.send("<h1>Hi</h1>")
// res.send({ key: "value" })

// 25.4 status code + send chained
// res.status(404).send("not found")
// res.status(500).send("server error")

// 25.5 serving static files
app.use(express.static(path.join(__dirname, "public")));


// ===== 26. CORS =====

const cors = require("cors");
app.use(cors());                                     // allow all origins
app.use(cors({ origin: "http://localhost:5500" }));  // restrict to one origin


// ===== 27. ROUTE PARAMS, QUERY PARAMS, BODY PARSING =====

// 27.1 dynamic route param
app.get("/user/:id", (req, res) => {
  // req.params.id
});

// 27.2 query params — parsed automatically
app.get("/search", (req, res) => {
  // req.query -> { q: "backend" } for /search?q=backend
});

// 27.3 body parsing — requires this middleware first
app.use(express.json());
app.post("/feedback", (req, res) => {
  // req.body
});


// ===== 28. CUSTOM + ERROR-HANDLING MIDDLEWARE =====

// 28.1 custom middleware — logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // required, or the request hangs
});

// 28.2 catch-all / 404 middleware — placed AFTER all routes
app.use((req, res) => {
  res.status(404).send("not found");
});

// 28.3 error-handling middleware — exactly 4 params, placed LAST
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send("something went wrong");
});


// ===== 29. express.Router() =====

// 29.1 creating a router (in a separate file)
const router = express.Router();

// 29.2 defining routes on a router — identical syntax to app.get/post/etc
router.get("/about", (req, res) => {});
router.post("/contact", (req, res) => {});

// 29.3 exporting a router
module.exports = router;

// 29.4 importing and mounting a router (in the main file)
const pageRoutes = require("./routes/pages");
app.use("/", pageRoutes);        // routes keep their original paths
app.use("/api", pageRoutes);     // routes get prefixed with /api


/* RECAP
9.  Node basics: process.version(s), globalThis
10. npm: init, install (--save-dev / -g), package.json fields, npm run,
    semver ranges (^, ~, exact, *)
11. Event loop: setTimeout/setImmediate/process.nextTick/Promise.then,
    and their rough firing order
12. fs (sync/async/promise-based, file + directory ops), path (join,
    resolve, basename, dirname, extname, parse), __dirname/__filename,
    process (env, argv, cwd, exit, on), os (platform, cpus, mem, homedir)
13. Buffers: Buffer.from/alloc, toString(); Streams: createReadStream,
    createWriteStream, .pipe(), event listeners (data/end/error)
14. EventEmitter: new EventEmitter(), .on/.once/.emit/.off, extending
    it in a class
22. Raw http: createServer, listen
23. req/res: url/method/headers, setHeader/statusCode/end, manual
    route matching via split()/startsWith()
24. dotenv: config() first line, process.env.NAME with fallback
25. Express setup: express(), app.listen, app.get/post/put/delete,
    res.send, res.status().send, express.static
26. CORS: cors() allow-all or restricted to one origin
27. req.params (route params), req.query (query params), req.body
    (needs express.json() first)
28. Middleware: custom logging (next()), catch-all 404, error handler
    (4 params, last)
29. express.Router(): separate file, router.get/post, module.exports,
    app.use(path, router) to mount
*/