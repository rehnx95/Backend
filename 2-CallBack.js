/* ============================================================
   CALLBACK FUNCTIONS, ASYNC BEHAVIOR & EVENT LISTENERS
   ============================================================
*/

/* ------------------------------------------------------------
   PART 1: WHAT IS A CALLBACK FUNCTION?
   ------------------------------------------------------------
   Directly built on First-Class Functions from your last file:
   since functions can be passed as arguments, a function passed
   INTO another function is called a CALLBACK — it gets "called
   back" by the host function, often at a LATER point in time.
   ------------------------------------------------------------ */

function greet(name) {
  console.log("Hello, " + name);
}

function processUser(name, callback) {
  // "callback" is just a parameter — it happens to hold a function
  console.log("Processing user:", name);
  callback(name); // the host function decides WHEN to call it back
}

processUser("Rehan", greet);
// Output:
//   Processing user: Rehan
//   Hello, Rehan
//
// "greet" is passed WITHOUT parentheses — we're handing over the
// function itself as a value, not calling it immediately. This
// is only possible because functions are first-class citizens.


/* ------------------------------------------------------------
   PART 2: SYNCHRONOUS CALLBACKS vs ASYNCHRONOUS CALLBACKS
   ------------------------------------------------------------
   Not all callbacks are async! Array methods like map/filter/
   forEach take callbacks too, but call them IMMEDIATELY, in
   order, as part of the normal synchronous flow.
   ------------------------------------------------------------ */

[1, 2, 3].forEach(function (num) {
  console.log("Synchronous callback:", num);
});
// Prints immediately, in order: 1, 2, 3
// forEach calls this callback SYNCHRONOUSLY, right there in the
// call stack, before moving to the next line of code.

console.log("This runs AFTER the forEach above, not before");


/* ------------------------------------------------------------
   PART 3: ASYNCHRONOUS CALLBACKS — WHY THEY EXIST AT ALL
   ------------------------------------------------------------
   JS is SINGLE-THREADED: it can only do ONE thing at a time on
   the main thread (one Call Stack). But some operations (timers,
   network requests, file reads) take real-world time to finish.

   Instead of FREEZING the entire program while waiting, JS:
     1. Hands the operation off (e.g., to the browser's Web APIs
        or Node's C++ APIs)
     2. Registers a CALLBACK to run once that operation completes
     3. Immediately continues executing the REST of the code
     4. Once the operation finishes, the callback is queued and
        eventually pushed back onto the Call Stack to run
   ------------------------------------------------------------ */

console.log("1. Start");

setTimeout(function () {
  console.log("3. This runs later, once the timer finishes");
}, 2000);

console.log("2. End (runs immediately, does NOT wait for the timer)");

// Output order:
//   1. Start
//   2. End (runs immediately, does NOT wait for the timer)
//   3. This runs later, once the timer finishes    <-- after ~2 sec
//
// This is EXACTLY what you already saw in the setTimeout +
// closures file — this is the underlying reason WHY that
// non-blocking behavior exists: single-threaded JS uses
// callbacks to handle time-consuming work without freezing.


/* ------------------------------------------------------------
   PART 4: BLOCKING THE MAIN THREAD — WHAT NOT TO DO
   ------------------------------------------------------------
   Since JS only has ONE call stack / one thread, if you put
   HEAVY synchronous work inside a callback (or anywhere, really),
   NOTHING else can run until that work finishes — including UI
   updates, other events, or other queued callbacks.
   ------------------------------------------------------------ */

function blockingCallback() {
  console.log("Starting heavy synchronous work...");

  // simulating heavy blocking work with a busy-loop
  var start = Date.now();
  while (Date.now() - start < 3000) {
    // deliberately do nothing for 3 real seconds —
    // this FREEZES the entire program during this loop
  }

  console.log("Heavy work finished after blocking everything for 3 sec");
}

// blockingCallback(); // uncomment to see the freeze yourself
// While this runs, NOTHING ELSE can execute — no other console.logs,
// no button clicks (in a browser), no other setTimeout callbacks,
// even if their timers have already expired. The single call
// stack is completely occupied.

/*
   TAKEAWAY: async callbacks (setTimeout, fetch, etc.) solve the
   "don't block the thread while waiting" problem — but you can
   still block the thread yourself by writing expensive synchronous
   code INSIDE a callback once it finally runs. Async doesn't
   magically make your code non-blocking; it just avoids blocking
   the wait itself.
*/

/* ------------------------------------------------------------
   PART 5: EVENT LISTENERS — CALLBACKS IN PRACTICE
   ------------------------------------------------------------
   addEventListener("click", callback) REGISTERS the callback
   with the browser, similar to how setTimeout registers one.
     - the callback does NOT run immediately
     - the browser waits, watching for an actual click
     - when the user clicks, the browser pushes this callback
       onto the Call Stack to execute it right then
     - this can happen an UNKNOWN number of times (unlike
       setTimeout, which fires once) — every click re-triggers it
   ------------------------------------------------------------ */

var btn = document.getElementById("click");
console.log("Button found:", btn);

btn.addEventListener("click", function () {
  console.log("Button was clicked!");
});

// and just watch it log every time — before enabling the counter
// version in Part 6 (keep only ONE version active at a time, or
// you'll get TWO listeners firing per click).


/* ------------------------------------------------------------
   PART 6: EVENT LISTENERS + CLOSURES — THE COUNTER EXAMPLE
   ------------------------------------------------------------
 */

function attachCounterButton() {
  var count = 0; // private state — captured by the closure below

  btn.addEventListener("click", function () {
    count++; // same "count" reused on every single click
    console.log("Button clicked", count, "times");
  });
}

attachCounterButton();

/*

   WHY THIS PROVES CLOSURES ARE REAL (not just theory):

   - attachCounterButton() runs ONCE, right when the script loads
   - it finishes almost instantly, and its Execution Context is
     popped off the call stack immediately
   - BUT the anonymous function passed to addEventListener still
     holds a closure over "count" — a live reference to that
     exact variable, not a copy
   - so later, when you click again, the callback still finds and
     updates the SAME "count" — even though attachCounterButton()
     itself finished executing long ago and its Execution Context
     is long gone
*/

/* ------------------------------------------------------------
   PART 8: MULTIPLE INDEPENDENT LISTENERS = MULTIPLE CLOSURES
   ------------------------------------------------------------
   If you had TWO buttons and ran this counter logic on each
   separately, each would get its OWN independent "count" — same
   principle as counter1/counter2 from your constructor-pattern
   example.
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   PART 9: WHY EVENT LISTENERS ARE "HEAVY" — REMOVE WHEN DONE
   ------------------------------------------------------------ */

/*
   Because event listener callbacks form closures, they can keep
   a chunk of memory ALIVE for as long as the listener is attached
   — this could be the entire time a page/app is open.

   In a small app with 2-3 buttons, this is totally harmless. But
   in a large, complex single-page application with THOUSANDS of
   dynamically created/destroyed elements (e.g. a chat app adding
   and removing message components constantly), forgetting to
   clean up old listeners means:
     - old closures (and whatever they reference) never get
       garbage collected
     - memory usage keeps growing over time -> a MEMORY LEAK
     - the app gets progressively slower/heavier the longer it runs

   GOOD PRACTICE — remove listeners once they're no longer needed:

     function handleClick() {
       console.log("Clicked!");
     }

     var btn2 = document.getElementById("myBtn");
     btn2.addEventListener("click", handleClick);

     // later, once this button/component is being removed/destroyed:
     btn2.removeEventListener("click", handleClick);
     // NOTE: removeEventListener requires passing the SAME named
     // function reference used in addEventListener — this is why
     // handleClick was defined separately instead of as an
     // anonymous function; you can't remove a listener you can't
     // reference again.

   Once removed, if nothing else references that closure, it
   becomes unreachable -> eligible for garbage collection ->
   memory freed. This directly builds on the GC concepts from your
   advanced closures file: a closure only stays alive as long as
   something can still reach it.
*/

function handleClick() {
  console.log("This listener can be removed later");
}

// btn.addEventListener("click", handleClick);
// btn.removeEventListener("click", handleClick); // removes it immediately in this toy example
//
// In a real app, removeEventListener would typically be called
// much later — e.g. when a component unmounts, a modal closes,
// or an element is deleted from the page — not right after
// adding it like this toy example does.


/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. A callback is just a function passed as an argument,
      "called back" by the host function — made possible by
      functions being first-class citizens
   2. Callbacks can be SYNCHRONOUS (forEach, map) or ASYNCHRONOUS
      (setTimeout, event listeners, network requests)
   3. JS is single-threaded — async callbacks let time-consuming
      work happen WITHOUT blocking the one call stack; the main
      thread keeps running the rest of the code meanwhile
   4. Never put heavy synchronous work inside a callback (or
      anywhere) — it will freeze the entire single-threaded app
      until that work finishes
   5. Event listeners are callbacks registered on DOM elements,
      waiting to fire whenever a matching event happens
   6. Event listener callbacks commonly form closures, keeping
      referenced variables alive for as long as the listener exists
      — the button demo above proves this live, in DevTools
   7. Multiple independent listeners each get their own closure —
      they don't interfere with each other
   8. Always removeEventListener when a listener is no longer
      needed, to let its closure (and captured memory) be
      garbage collected — critical in large, long-running apps

   HOW TO USE THIS FILE:
     - Read/run Parts 1-4 with `node` for the console-only concepts
     - Save this file as 2-CallBack.js next to your HTML page
       (with <button id="click">Click</button>) to run Parts 5-9
       live in a browser
   ------------------------------------------------------------ */