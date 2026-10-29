/* ============================================================
   ADVANCED CLOSURES — Data Hiding, Constructor Pattern,
   Memory Management & Garbage Collection
   ============================================================ */


/* ------------------------------------------------------------
   PART 1: RECAP — WHAT MAKES A CLOSURE
   ------------------------------------------------------------
   closure = function + reference to its lexical environment
   lexical environment = local memory + reference to PARENT's
                          lexical environment
   scope chain = the path used to look up variables not found
                 locally, walking outward through parents
   ------------------------------------------------------------ */

function outer() {
  var a = 10;
  function inner() {
    console.log(a); // found via scope chain, not local to inner()
  }
  return inner;
}
outer()(); // 10  <-- calling the returned function immediately


/* ------------------------------------------------------------
   PART 2: let/const ARE ALSO CLOSED OVER (BLOCK SCOPE)
   ------------------------------------------------------------
   Closures aren't a "var-only" or "function-only" thing —
   let/const declarations inside a block are captured too,
   respecting THEIR block-scoped rules.
   ------------------------------------------------------------ */

function blockScopeClosure() {
  if (true) {
    let message = "I'm block-scoped";

    function showMessage() {
      console.log(message); // closes over "message" from the if-block
    }

    // showMessage still works even called from outside the if-block's
    // original execution, as long as we hold a reference to it
    setTimeout(showMessage, 1000);
  }
}
blockScopeClosure(); // "I'm block-scoped" after ~1 sec


/* ------------------------------------------------------------
   PART 3: SCOPE CHAIN RESOLVES CONFLICTING NAMES CORRECTLY
   ------------------------------------------------------------
   Even if the SAME variable name exists in multiple scopes,
   the closure always resolves to the NEAREST one in its own
   scope chain — never accidentally grabs a same-named variable
   from somewhere else.
   ------------------------------------------------------------ */

var value = "global value";

function makeReader() {
  var value = "local value inside makeReader"; // shadows the global one

  return function reader() {
    console.log(value); // scope chain finds THIS "value" first, stops here
  };
}

var read = makeReader();
read(); // "local value inside makeReader"  (NOT "global value")
// The scope chain walk stops as soon as it finds a match —
// it never continues past a match, so the global "value" is
// never even reached here.


/* ------------------------------------------------------------
   PART 4: DATA HIDING / ENCAPSULATION — THE CORE USE CASE
   ------------------------------------------------------------
   Without closures, this counter would need a global variable
   that ANY code could read or overwrite — fragile and unsafe.
   ------------------------------------------------------------ */

// ---- BAD: no encapsulation ----
var counterValue = 0; // exposed globally — anyone can mess with it
function incrementBad() {
  counterValue++;
}
incrementBad();
counterValue = 999; // oops — nothing stops this corruption
console.log("Bad counter (corrupted):", counterValue);

// ---- GOOD: closure-based encapsulation ----
function createCounter() {
  var count = 0; // PRIVATE — no direct outside access at all

  return {
    increment: function () {
      count++;
      console.log("Count:", count);
    },
    decrement: function () {
      count--;
      console.log("Count:", count);
    },
    getValue: function () {
      return count;
    },
  };
}

var goodCounter = createCounter();
goodCounter.increment(); // Count: 1
goodCounter.increment(); // Count: 2
goodCounter.decrement(); // Count: 1
console.log("Final value:", goodCounter.getValue()); // Final value: 1

// console.log(goodCounter.count); // undefined — "count" is NOT a
// property on the returned object; it's a variable trapped inside
// createCounter()'s lexical environment. The ONLY way to read or
// change it is through the exposed increment/decrement/getValue
// functions — true data privacy via closures.


/* ------------------------------------------------------------
   PART 5: CONSTRUCTOR FUNCTIONS — MULTIPLE INDEPENDENT INSTANCES
   ------------------------------------------------------------
   Each call to createCounter() (or a constructor) produces a
   BRAND NEW execution context, so each instance gets its OWN
   private "count" — none of them interfere with each other.
   ------------------------------------------------------------ */

function Counter() {
  // "this" refers to the new object being constructed
  var count = 0; // private to THIS specific instance

  this.increment = function () {
    count++;
    console.log("Instance count:", count);
  };

  this.decrement = function () {
    count--;
    console.log("Instance count:", count);
  };
}

var counter1 = new Counter(); // fresh, independent closure over its own "count"
var counter2 = new Counter(); // a SEPARATE, independent closure

counter1.increment(); // Instance count: 1
counter1.increment(); // Instance count: 2
counter2.increment(); // Instance count: 1   <-- counter2's own count, unaffected by counter1

/*
   WHY THIS MATTERS:
   counter1 and counter2 each hold their own closure over a
   DIFFERENT "count" variable, created fresh on each `new Counter()`
   call. This is the same principle as multiple calls to
   outerCounter() in the earlier closures file — but wrapped in
   the constructor-function pattern so it can be used with `new`.
*/


/* ------------------------------------------------------------
   PART 6: GARBAGE COLLECTION — THE BASIC IDEA
   ------------------------------------------------------------
   The Garbage Collector (GC) is a program inside the JS engine
   that automatically frees memory occupied by values that are
   no longer REACHABLE from anywhere in the running program.
   ------------------------------------------------------------ */

function createTempData() {
  var bigArray = new Array(1000).fill("some data"); // takes up memory
  console.log("bigArray created, length:", bigArray.length);
}
createTempData();
// Once createTempData() finishes and returns:
//   - its Execution Context is popped off the call stack
//   - NOTHING references "bigArray" anymore (no closure captured it)
//   - it becomes UNREACHABLE -> eligible for garbage collection
//   - the GC will eventually free that memory


/* ------------------------------------------------------------
   PART 7: HOW CLOSURES CAN CAUSE MEMORY LEAKS
   ------------------------------------------------------------
   If a closure keeps a reference to something large, that large
   thing CANNOT be garbage collected — even if you don't actually
   need it anymore — because it's still "reachable" through the
   closure.
   ------------------------------------------------------------ */

function createLeakyClosure() {
  var bigData = new Array(1000000).fill("leaked data"); // large!

  return function () {
    // this function doesn't even USE bigData, but because it's
    // defined in the same scope, older JS engines might keep
    // bigData alive in memory as long as this closure exists
    console.log("This function never touches bigData");
  };
}

var leakyFn = createLeakyClosure();
// As long as "leakyFn" exists somewhere and is reachable
// (e.g. stored in a variable, attached to an event listener,
// held by a long-lived object), bigData COULD remain in memory
// depending on engine optimizations — a classic closure-related
// memory leak pattern, especially dangerous in long-running apps
// (e.g. a single-page app that never reloads).

// leakyFn = null; // removing the last reference makes the whole
// closure (and anything only it referenced) eligible for GC


/* ------------------------------------------------------------
   PART 8: V8 IS SMART — IT PRUNES UNUSED CLOSURE VARIABLES
   ------------------------------------------------------------ */

function createSmartClosure() {
  var used = "I am referenced below";
  var unused = "I am NOT referenced by the returned function";

  return function () {
    console.log(used); // only "used" is actually touched
  };
}

var smartFn = createSmartClosure();
smartFn(); // "I am referenced below"

/*
   Modern engines like V8 (used in Chrome and Node.js) perform
   static analysis and can determine that "unused" is never
   actually accessed by the returned function. Even though both
   variables technically live in the same lexical environment,
   V8 can garbage collect "unused" early — it does NOT blindly
   keep the entire outer scope alive just because a closure exists.

   TAKEAWAY: closures keep alive only what's ACTUALLY referenced,
   not everything that happens to be nearby in the same scope —
   at least in engines smart enough to detect it. Still, be
   deliberate: don't rely on this to make sloppy closures "safe by
   default" — explicitly nulling out large unneeded references
   (like `leakyFn = null` above) remains good practice, especially
   in long-running applications (servers, SPAs) where leaks
   accumulate over time.
*/


/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. Closures capture lexical environment: local memory + link
      to parent's environment — works for var, let, AND const
   2. Scope chain resolution stops at the NEAREST matching
      variable name — no accidental cross-scope collisions
   3. Data hiding: wrap private state in a function, expose only
      specific methods to read/modify it (module pattern)
   4. Constructor pattern: each `new` call creates an independent
      closure over its own private state — instances don't clash
   5. Garbage Collector frees memory for anything UNREACHABLE
   6. Closures can cause memory leaks by keeping large data
      reachable for longer than necessary
   7. V8 is smart enough to collect genuinely unused variables
      even inside an active closure's scope — but write
      deliberate code regardless
   ------------------------------------------------------------ */