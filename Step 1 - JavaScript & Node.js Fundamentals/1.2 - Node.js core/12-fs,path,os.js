// ============================================================
// PATH MODULE — builds path STRINGS safely, never touches disk
// ============================================================
// PROBLEM: Windows uses backslashes (C:\Users\x), Linux/Mac use
// forward slashes (/home/x). Hardcoding "/" yourself breaks on
// someone else's OS. path.join() fixes this automatically.

const path = require("path");
// require() = Node's way of loading a built-in module.
// 'path' is built into Node — no npm install needed.
// path is now an OBJECT full of functions: join, basename, etc.

// __dirname = a NODE GLOBAL, every file gets this automatically.
// It means: "the folder THIS FILE lives in." You never calculate
// it yourself.
console.log("__dirname is:", __dirname);

// path.join(piece1, piece2, ...) glues pieces into ONE path string,
// inserting the correct slash for your OS.
const fullPath = path.join(__dirname, "data", "notes.txt");
console.log("fullPath is:", fullPath);
// IMPORTANT: this does NOT create anything. path only builds STRINGS.

console.log("basename (just filename):", path.basename(fullPath));
console.log("extname (just extension):", path.extname(fullPath));
console.log("dirname (just folder):", path.dirname(fullPath));


// ============================================================
// FS MODULE (File System) — THIS is where disk is actually touched
// ============================================================
const fs = require("fs");

// You tried: console.log(fs)
// This prints the fs OBJECT itself — a huge list of function names
// (readFile, writeFile, mkdir, existsSync...). It's just Node showing
// you "here is everything this module gives you to call." You don't
// need to read the whole thing — just know fs is an object full of
// tools, same as path was.


// ------------------------------------------------------------
// YOUR EXAMPLE — simplest possible async write, broken down
// ------------------------------------------------------------
console.log("start");

fs.writeFile("new.txt", "hello", () => {
  // fs.writeFile(filename, content, callback)
  // Creates "new.txt" in your CURRENT FOLDER with "hello" inside.
  // This callback does NOT run immediately — it runs LATER,
  // once the write actually finishes on disk.
  console.log("done");
});

console.log("end");

// ORDER YOU'LL SEE:  start -> end -> done
// WHY: writeFile doesn't block. Node fires it off, moves straight to
// "end", and only comes back for "done" once the disk write finishes.
// Same non-blocking idea as setTimeout — just with real disk I/O.


// ------------------------------------------------------------
// THREE WAYS TO DO THE SAME THING: sync, callback, promise
// ------------------------------------------------------------

// --- 1) SYNC — blocks, waits, simple, but freezes everything else ---
const dataFolder = path.join(__dirname, "data");

// existsSync checks first, so mkdirSync doesn't crash on a folder
// that's already there.
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
  console.log("created the data folder");
} else {
  console.log("data folder already exists, skipped");
}

fs.writeFileSync(fullPath, "Hello, this is my first file written by Node.");
const syncContent = fs.readFileSync(fullPath, "utf8");
// 'utf8' means "give me a readable string," not raw binary bytes.
console.log("sync read result:", syncContent);


// --- 2) CALLBACK — non-blocking, same pattern as your writeFile above ---
console.log("--- starting callback read ---");

fs.readFile(fullPath, "utf8", (err, data) => {
  if (err) throw err; // always check errors in callbacks
  console.log("callback read result (runs LATER):", data);
});

console.log("this line runs BEFORE the callback result appears above");


// --- 3) PROMISE-BASED — same non-blocking behavior, async/await syntax ---
// You already know await from Namaste JS promises — same thing here.
const fsp = require("fs/promises");
// fs/promises = a DIFFERENT version of fs where every method
// returns a Promise instead of taking a callback function.

async function readWithPromise() {
  const data = await fsp.readFile(fullPath, "utf8");
  console.log("promise-based read result:", data);
}
readWithPromise();


// ============================================================
// PROCESS — a NODE GLOBAL, no require() needed
// ============================================================
// process = info about the currently running Node program itself.

console.log("--- process info ---");
console.log("OS Node is running on:", process.platform);
console.log("Node version:", process.version);

// cwd() = folder you were STANDING IN ON THE TERMINAL when you typed
// `node file.js`. DIFFERENT from __dirname (always the file's own
// folder, never changes).
console.log("cwd (where you ran the command from):", process.cwd());

// argv = command-line arguments you typed after the filename.
// e.g. running: node modules.js hello world
// argv = [nodePath, filePath, 'hello', 'world']
console.log("command-line arguments:", process.argv);

// env = reads environment variables from your OS.
// Real apps use this for secrets (API keys, passwords) instead of
// hardcoding them into code. You'll use this for real in Step 3.
console.log("HOME env variable:", process.env.HOME);