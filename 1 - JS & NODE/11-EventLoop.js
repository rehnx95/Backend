// ============================================================
// TOPIC 11: NODE'S EVENT LOOP PHASES
// ============================================================

// The event loop runs in a fixed, repeating sequence of PHASES:
//
//   timers -> pending callbacks -> poll -> check -> close callbacks
//     ^                                                  |
//     |__________________ loop repeats __________________|
//
// timers   -> runs setTimeout / setInterval callbacks whose time is up
// poll     -> runs I/O callbacks (like fs.readFile finishing)
// check    -> runs setImmediate callbacks
// close    -> cleanup stuff


// -------------------------------------------
// RULE 1: synchronous code ALWAYS runs first, completely
// -------------------------------------------
console.log('1: start');   // runs immediately
console.log('2: end');     // runs immediately, right after


// -------------------------------------------
// RULE 2: process.nextTick() jumps EVERYTHING
// -------------------------------------------
// It doesn't belong to any phase. It runs right after the CURRENT
// operation finishes, before the event loop even moves on.

process.nextTick(() => {
  console.log('4: nextTick (jumps the line)');
});


// -------------------------------------------
// RULE 3: setTimeout vs setImmediate — depends on WHERE you are
// -------------------------------------------

// AT THE TOP LEVEL of a script (like right here):
// order between setTimeout(fn, 0) and setImmediate(fn) is
// NOT GUARANTEED. Don't write code that depends on it.
setTimeout(() => console.log('5 or 6: setTimeout (top level)'), 0);
setImmediate(() => console.log('5 or 6: setImmediate (top level)'));

console.log('3: still synchronous, runs before any of the above');


// INSIDE an I/O callback, the order IS guaranteed.
// Why: after I/O finishes you're sitting in the "poll" phase.
// The very next phase is "check" (setImmediate) — timers requires
// looping all the way back to the top. So setImmediate ALWAYS wins.
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('B: setTimeout (inside I/O — loses)'), 0);
  setImmediate(() => console.log('A: setImmediate (inside I/O — always wins)'));
});


// -------------------------------------------
// WHAT YOU ACTUALLY VERIFIED BY RUNNING THIS:
// -------------------------------------------
// 1. Sync code (1, 2, 3) always first
// 2. nextTick (4) jumps ahead of timers/setImmediate
// 3. Top-level setTimeout vs setImmediate — order can vary
// 4. Inside I/O callback — setImmediate ALWAYS beats setTimeout