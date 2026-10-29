// ============================================================
// TOPIC 9: WHAT NODE IS — V8 & libuv
// ============================================================

// PROBLEM: JavaScript was built in 1995 to run ONLY inside browsers.
// It could click buttons, change HTML — but it could NEVER read a file,
// open a network connection, or talk to your OS. Browsers block that
// on purpose, for security.

// NODE'S FIX (2009): take Chrome's JS engine, glue it to a layer that
// CAN talk to the OS. Now the same JS language can run OUTSIDE the
// browser, on a server, with real file/network access.

// Node = TWO PARTS glued together:

// -------------------------------------------
// PART 1: V8
// -------------------------------------------
// V8 is Google's JS engine (same one Chrome uses).
// Its job: take your JS code, turn it into machine code, run it.
// This is the part that understands closures, promises, `this` —
// everything you already learned in Namaste JS.
// V8 by itself has NO idea what a file or network is.

// -------------------------------------------
// PART 2: libuv
// -------------------------------------------
// libuv is a C library Node adds NEXT TO V8.
// This is the part that actually talks to your operating system:
// reading files, opening network sockets, timers.
// libuv is also what runs the EVENT LOOP.

// EXAMPLE — this single line touches both parts:
const fs = require('fs');

fs.readFile(__filename, 'utf8', (err, data) => {
  // V8 runs your JS code (this callback).
  // libuv is the one that actually went to the disk, read the file
  // in the BACKGROUND, and only called V8 back once it was done.
  console.log('File read finished — libuv did the disk work, V8 ran this callback');
});

console.log('This prints FIRST — V8 kept running your code while libuv worked in the background');


// -------------------------------------------
// WHY THIS MATTERS
// -------------------------------------------
// Because libuv handles slow I/O work OFF to the side, V8's single
// thread never freezes waiting for a disk or network. This is the
// SAME model as the browser event loop you already know:
//
//   Browser:  setTimeout -> Web API      -> callback queue -> event loop
//   Node:     fs.readFile -> libuv       -> callback queue -> event loop
//
// Same idea, different engine doing the "outsourcing."