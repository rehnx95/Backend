/* ============================================================
   THE EVENT LOOP — How Async JS Actually Works in the Browser
   ============================================================
   NOTE: This file uses browser-specific things (setTimeout,
   fetch, Promises) that also work in Node.js in similar ways,
   EXCEPT the "window" object and true DOM/Web APIs, which are
   browser-only. Run this with `node` for the setTimeout/Promise
   parts; the "window" comments are browser-only concepts.
   ============================================================ */


/* ------------------------------------------------------------
   PART 1: RECAP — JS ENGINE, SINGLE THREAD, CALL STACK
   ------------------------------------------------------------
   JS itself is synchronous and single-threaded: ONE call stack,
   ONE thing running at a time. When a program starts, the
   Global Execution Context (GEC) is pushed onto the Call Stack
   first — exactly as you've already learned.

   So then... how does JS do things like wait 2 seconds, or
   fetch data from a server, WITHOUT freezing? The answer is:
   IT DOESN'T. The JS engine alone can't. The BROWSER helps it.
   ------------------------------------------------------------ */

console.log("Call Stack: Global Execution Context running");


/* ------------------------------------------------------------
   PART 2: BROWSER "SUPERPOWERS" — WEB APIs
   ------------------------------------------------------------
   The JS engine (like V8) is just ONE piece embedded INSIDE the
   browser. The browser ALSO provides extra capabilities the JS
   engine itself doesn't have:
     - setTimeout / setInterval (timers)
     - fetch (network requests)
     - DOM APIs (document.querySelector, etc.)
     - localStorage / sessionStorage
     - console (yes, even console.log is technically a Web API!)

   These are called WEB APIs. They are NOT part of JavaScript
   the language — they're provided by the browser ENVIRONMENT.
   That's why the same JS engine behaves differently in Node.js
   (no DOM, no window, but has fs, http, etc. instead — Node
   provides its OWN set of APIs, similar in spirit).

   All of these live on the global "window" object in a browser:
     window.setTimeout === setTimeout   // true
     window.console === console         // true
     window.fetch === fetch             // true
   You usually don't type "window." explicitly, but it's always
   there implicitly in browser JS.
   ------------------------------------------------------------ */

// In a browser console, try typing: window
// You'll see setTimeout, fetch, document, localStorage, etc.
// ALL attached to it — none of these come from the JS engine itself.


/* ------------------------------------------------------------
   PART 3: WHAT ACTUALLY HAPPENS WHEN YOU CALL setTimeout
   ------------------------------------------------------------ */

console.log("1. Start");

setTimeout(function timerCallback() {
  console.log("4. Timer finished, callback finally runs");
}, 3000);

console.log("2. This runs immediately, right after registering the timer");

/*
   STEP-BY-STEP, WHAT REALLY HAPPENS:

   1. console.log("1. Start") runs on the Call Stack, then pops off
   2. setTimeout(...) is called
        -> JS hands the CALLBACK + the 3000ms timer OFF to the
           BROWSER's Web API environment (NOT the call stack)
        -> setTimeout() ITSELF returns immediately (it doesn't wait)
        -> its own tiny bit of work is done, popped off the stack
   3. console.log("2. ...") runs immediately, right after
   4. Meanwhile, in the Web API environment (separate from JS),
      the browser's own timer counts down 3000ms in the background
   5. Once 3000ms passes, the browser does NOT immediately run
      the callback. It moves timerCallback into the CALLBACK QUEUE
   6. The EVENT LOOP is constantly checking: "Is the Call Stack
      empty right now?"
        -> if YES: take the first thing waiting in the Callback
           Queue and push it onto the Call Stack to execute
        -> if NO: keep waiting, checking again
   7. Since the stack was already empty after step 3 finished,
      the moment timerCallback lands in the Callback Queue, the
      Event Loop pushes it onto the stack, and IT finally runs

   Output order:
     1. Start
     2. This runs immediately, right after registering the timer
     4. Timer finished, callback finally runs   <-- after ~3 sec

   IMPORTANT SUBTLETY: setTimeout(fn, 3000) does NOT guarantee
   the callback runs at EXACTLY 3000ms. It guarantees the callback
   is placed in the Callback Queue after AT LEAST 3000ms — but it
   still has to WAIT for the Call Stack to be empty. If the stack
   is busy (e.g. running other heavy synchronous code) when the
   timer expires, the callback just waits longer in the queue.
*/


/* ------------------------------------------------------------
   PART 4: THE CALLBACK QUEUE (a.k.a. TASK QUEUE / MACROTASK QUEUE)
   ------------------------------------------------------------
   This is where callbacks from things like setTimeout and DOM
   event listeners (click, etc.) wait once they're ready to run,
   until the Event Loop gives them a turn on the Call Stack.
   ------------------------------------------------------------ */

/*
   Example with an event listener (browser only):

     document.getElementById("btn").addEventListener("click", function () {
       console.log("Button clicked!");
     });

   Every time the button is clicked, the browser detects the
   event and pushes this callback into the CALLBACK QUEUE, where
   it waits for the Event Loop to move it to the Call Stack —
   the SAME queue setTimeout callbacks use.
*/


/* ------------------------------------------------------------
   PART 5: THE MICROTASK QUEUE — HIGHER PRIORITY
   ------------------------------------------------------------
   Promises (and some other things like MutationObserver) do NOT
   go into the regular Callback Queue. They go into a SEPARATE,
   HIGHER-PRIORITY queue: the MICROTASK QUEUE.

   The Event Loop ALWAYS empties the ENTIRE Microtask Queue first,
   before taking even ONE task from the (lower-priority) Callback
   Queue — every single time the Call Stack becomes empty.
   ------------------------------------------------------------ */

console.log("A. Start of script");

setTimeout(function () {
  console.log("D. setTimeout callback (Callback Queue / macrotask)");
}, 0); // even with 0ms delay!

Promise.resolve().then(function () {
  console.log("C. Promise callback (Microtask Queue)");
});

console.log("B. End of script");

/*
   Output order (even though setTimeout has 0ms delay!):
     A. Start of script
     B. End of script
     C. Promise callback (Microtask Queue)
     D. setTimeout callback (Callback Queue / macrotask)

   WHY does the Promise callback run BEFORE the setTimeout
   callback, even though setTimeout was written FIRST and has
   a 0ms delay?

   1. Both A and B are synchronous -> run immediately, in order
   2. setTimeout's callback goes to the Web API environment, then
      (once its 0ms timer instantly expires) into the CALLBACK QUEUE
   3. Promise's .then() callback goes into the MICROTASK QUEUE
      once the promise resolves
   4. Call Stack becomes empty after B runs
   5. Event Loop checks: "Anything in the Microtask Queue?" -> YES
        -> runs C, and checks AGAIN for more microtasks
        -> Microtask Queue is now empty
   6. ONLY NOW does the Event Loop check the Callback Queue -> runs D

   RULE: Microtask Queue is ALWAYS fully drained before the
   Event Loop touches the Callback Queue — no matter how the
   delays or write-order look in your code.
*/


/* ------------------------------------------------------------
   PART 6: MULTIPLE PROMISES — MICROTASK QUEUE IN ACTION
   ------------------------------------------------------------ */

console.log("1: sync code");

setTimeout(function () {
  console.log("5: setTimeout (macrotask)");
}, 0);

Promise.resolve().then(function () {
  console.log("3: first microtask");
});

Promise.resolve().then(function () {
  console.log("4: second microtask");
});

console.log("2: more sync code");

/*
   Output:
     1: sync code
     2: more sync code
     3: first microtask
     4: second microtask
     5: setTimeout (macrotask)

   Both promise callbacks (3 and 4) run BEFORE the setTimeout
   callback (5), because ALL microtasks are drained first, in
   the order they were queued, before the Event Loop even LOOKS
   at the Callback Queue.
*/


/* ------------------------------------------------------------
   PART 7: STARVATION — WHEN MICROTASKS NEVER STOP
   ------------------------------------------------------------
   Because the Event Loop insists on FULLY draining the Microtask
   Queue before running anything from the Callback Queue, a
   situation where microtasks keep CREATING MORE microtasks can
   starve out setTimeout callbacks and event listeners forever.
   ------------------------------------------------------------ */

function recursiveMicrotask() {
  Promise.resolve().then(function () {
    console.log("Microtask running...");
    recursiveMicrotask(); // queues ANOTHER microtask, forever
  });
}

// recursiveMicrotask(); // DO NOT actually run this uncommented!
// setTimeout(() => console.log("I will NEVER run"), 100);
//
// WHY: every time one microtask finishes, it immediately queues
// ANOTHER microtask before the Event Loop gets a chance to check
// the Callback Queue. Since the Microtask Queue must be FULLY
// empty before the Callback Queue gets a turn, and it never
// actually becomes empty here, the setTimeout callback above
// would be STARVED — it would wait forever and never run, even
// though its delay was only 100ms.
//
// This is a REAL bug pattern in production apps: badly-written
// recursive Promise chains (or excessive .then() chaining without
// end conditions) can starve out UI updates, timers, and user
// interactions, making an app appear completely frozen even
// though the Call Stack is technically never "stuck" on one
// single synchronous task.


/* ------------------------------------------------------------
   QUICK RECAP

   1. JS itself is single-threaded and synchronous — only the
      Call Stack executes code
   2. The BROWSER provides Web APIs (setTimeout, fetch, DOM,
      localStorage) that the JS engine alone doesn't have —
      these are the "superpowers" that make async possible,
      all reachable through the "window" object
   3. setTimeout hands its callback to the browser's Web API
      environment; once the timer expires, the callback moves
      to the CALLBACK QUEUE (macrotask queue)
   4. The EVENT LOOP constantly checks: is the Call Stack empty?
      If yes, move the next ready task onto the stack
   5. Promises use a SEPARATE, HIGHER-PRIORITY MICROTASK QUEUE
   6. The Event Loop ALWAYS fully drains the Microtask Queue
      before touching the Callback Queue — every single time
   7. STARVATION: if microtasks keep generating more microtasks,
      the Callback Queue (setTimeout, click handlers, etc.) can
      be starved and never get a turn to run
   ------------------------------------------------------------ */