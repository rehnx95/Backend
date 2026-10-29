// ============================================================
// MODULES — how JS files share code with each other
// ============================================================
// PROBLEM: without modules, every variable/function you write would
// live in ONE giant global space. Two files couldn't safely use the
// same variable name without colliding. Modules let each FILE have
// its own private scope, and EXPLICITLY choose what to share.
//
// Node has TWO different module systems. This confuses a lot of
// people because they look similar but behave differently.


// ============================================================
// SYSTEM 1: CommonJS (CJS) — Node's ORIGINAL, DEFAULT system
// ============================================================
// Uses require() to import, module.exports to export.
// This is what you've been using in EVERY file so far:
//   const fs = require('fs');
//   const path = require('path');

// ------------------------------------------------------------
// EXPORTING (in a file you write yourself, e.g. math.js)
// ------------------------------------------------------------
// module.exports = whatever you want other files to be able to use.
// Only ONE thing can be assigned to module.exports per file.

// -- imagine this is the content of math.js --
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };
// This exports an OBJECT containing both functions.
// { add, subtract } is shorthand for { add: add, subtract: subtract }


// ------------------------------------------------------------
// IMPORTING (in a different file, e.g. app.js)
// ------------------------------------------------------------
// const math = require('./math');   <- './' means "look in THIS folder"
// console.log(math.add(2, 3));      -> 5
//
// OR destructure it directly, same idea as destructuring an object
// from Namaste JS:
// const { add, subtract } = require('./math');
// console.log(add(2, 3));           -> 5


// ------------------------------------------------------------
// KEY FACTS ABOUT CommonJS
// ------------------------------------------------------------
// 1. require() is SYNCHRONOUS — it BLOCKS and loads the whole file
//    immediately before moving to the next line. This is why it
//    works fine at the very top of a file, before anything else runs.
//
// 2. No file extension needed in package.json config — CommonJS is
//    just the DEFAULT. If you do nothing special, your .js files
//    are CommonJS automatically.
//
// 3. __dirname and __filename (which you already used) ONLY exist
//    in CommonJS. They are NOT available in ES Modules (see below).


// ============================================================
// SYSTEM 2: ES Modules (ESM) — the MODERN, standard JS system
// ============================================================
// Uses import/export — the SAME syntax browsers and modern
// frontend frameworks use. This is the direction JS is moving,
// but Node still defaults to CommonJS unless you opt in.

// ------------------------------------------------------------
// HOW TO TURN IT ON
// ------------------------------------------------------------
// In package.json, add:
//   { "type": "module" }
// This tells Node: "treat every .js file in this project as ESM,
// not CommonJS." You cannot mix require() and import in the same
// file — pick one system per project (usually).

// ------------------------------------------------------------
// EXPORTING (ESM style)
// ------------------------------------------------------------
// -- imagine this is math.js, in an ESM project --
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
// export in FRONT of each function — no need to bundle them into
// one object at the bottom like CommonJS required.

// You can ALSO have exactly one "default" export per file:
// export default function multiply(a, b) { return a * b; }


// ------------------------------------------------------------
// IMPORTING (ESM style)
// ------------------------------------------------------------
// import { add, subtract } from './math.js';
// console.log(add(2, 3));   -> 5
//
// Note: ESM REQUIRES the file extension (.js) in the import path.
// CommonJS's require('./math') does NOT need the extension.
// This trips people up constantly — it's a real difference, not a typo.


// ------------------------------------------------------------
// KEY FACTS ABOUT ES Modules
// ------------------------------------------------------------
// 1. import is ASYNCHRONOUS under the hood (even though it looks
//    like it runs top-to-bottom) — this is WHY ESM can do things
//    CommonJS can't, like "top-level await" (using await outside
//    of an async function, directly in the file).
//
// 2. __dirname and __filename do NOT exist in ESM. If you need
//    them, you have to reconstruct them manually using a different
//    built-in (import.meta.url) — not something to worry about yet.
//
// 3. Browsers ALSO use this exact import/export syntax — which is
//    part of why ESM is considered the "future" — one shared module
//    syntax for both frontend and backend JS.


// ============================================================
// SIDE BY SIDE — same two functions, both systems
// ============================================================
//
//                CommonJS                    ES Modules
//   export:      module.exports = {...}      export function ...
//   import:      require('./file')           import {...} from './file.js'
//   extension:   optional in require path     REQUIRED in import path
//   loading:     synchronous (blocking)       asynchronous under the hood
//   default in:  every Node project           opt-in via package.json
//   Node?


// ============================================================
// WHICH ONE SHOULD YOU USE RIGHT NOW?
// ============================================================
// Keep using CommonJS (require/module.exports) for now — it's what
// your roadmap and most tutorials/Express examples still assume,
// and what every file you've written so far already uses.
// Recognize import/export when you SEE it (npm docs, modern
// tutorials, frontend code) — but you don't need to switch your
// own projects over yet.