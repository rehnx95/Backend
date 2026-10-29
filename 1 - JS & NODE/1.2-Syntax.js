/*
=====================================================================
 2 — NODE CORE SYNTAX REFERENCE
 Items 9-14 of the roadmap + CommonJS vs ES Modules
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

// WHY THIS MATTERS LATER: app.get() in Express is this exact
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