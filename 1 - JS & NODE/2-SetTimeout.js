/* ============================================================
   setTimeout + CLOSURES — THE CLASSIC INTERVIEW QUESTION
   ============================================================
   GOAL: print 1, 2, 3, 4 with a 1-second gap between each,
   using a loop and setTimeout.
   ============================================================ */


/* ------------------------------------------------------------
   PART 1: HOW setTimeout ACTUALLY WORKS
   ------------------------------------------------------------
   setTimeout does NOT pause your code. It:
     1. Registers the callback + timer with the browser/Node
     2. Immediately moves on to the NEXT line (non-blocking)
     3. Once the timer expires, the callback is queued and
        eventually pushed onto the Call Stack to run
   ------------------------------------------------------------ */

console.log("Start");
setTimeout(function () {
  console.log("This runs later, after ~2 seconds");
}, 2000);
console.log("End");

// Output order:
//   Start
//   End
//   (~2 sec later) This runs later, after ~2 seconds
//
// "End" prints BEFORE the timeout callback, even though the
// setTimeout line appears BEFORE console.log("End") in the code.
// This proves setTimeout doesn't block/pause execution.


/* ------------------------------------------------------------
   PART 2: THE BROKEN VERSION — var IN A LOOP
   ------------------------------------------------------------ */

function printBroken() {
  for (var i = 1; i <= 5; i++) {
    setTimeout(function () {
      console.log(i); // closure over "i"
    }, i * 1000);
  }
}
printBroken();
// Prints "6" five times, once per second, instead of 1,2,3,4,5!
//
// WHY:
//   - var is FUNCTION-scoped, not block-scoped
//   - there is only ONE "i" for the ENTIRE loop
//   - all 5 setTimeout callbacks form a closure over that SAME "i"
//   - the loop runs to completion almost instantly (setTimeout
//     doesn't block), so by the time i <= 5 becomes false,
//     "i" has already become 6
//   - THEN, one by one over the next 5 seconds, each callback
//     finally runs and reads "i" — which is now 6 for all of them


/* ------------------------------------------------------------
   PART 3: SOLUTION 1 — USE let INSTEAD OF var
   ------------------------------------------------------------ */

function printWithLet() {
  for (let i = 1; i <= 5; i++) {
    setTimeout(function () {
      console.log(i); // closure over THIS iteration's "i"
    }, i * 1000);
  }
  console.log("hello"); // prints IMMEDIATELY, before any timeout fires
}
printWithLet();
// Prints:
//   hello        <-- immediately (synchronous code runs first)
//   1            <-- after ~1 sec
//   2            <-- after ~2 sec
//   3            <-- after ~3 sec
//   4            <-- after ~4 sec
//   5            <-- after ~5 sec
//
// WHY THIS WORKS:
//   - let is BLOCK-scoped
//   - JS creates a NEW "i" for EVERY single iteration of the loop
//   - each setTimeout callback closes over its OWN separate "i",
//     not one shared variable
//   - so callback #1 remembers i=1 forever, callback #2 remembers
//     i=2 forever, and so on — independent closures


/* ------------------------------------------------------------
   PART 4: SOLUTION 2 — KEEP var, BUT CREATE A CLOSURE MANUALLY
   ------------------------------------------------------------
   If you're forced to use var (older codebases, or just for the
   interview follow-up question "now do it WITHOUT let"), you can
   fix it by wrapping setTimeout in its own function. Each CALL to
   that function creates a fresh local scope / fresh variable.
   ------------------------------------------------------------ */

function printWithClosureFix() {
  for (var i = 1; i <= 5; i++) {
    close(i); // pass the CURRENT value of i into a new function call
  }
  console.log("hello");

  function close(i) {
    // this "i" is a BRAND NEW parameter/local variable,
    // created fresh on every call to close()
    setTimeout(function () {
      console.log(i); // closure over THIS call's own local "i"
    }, i * 1000);
  }
}
printWithClosureFix();
// Prints "hello" immediately, then 1, 2, 3, 4, 5 at 1-second
// intervals — same correct result as the `let` version.
//
// WHY THIS WORKS:
//   - close(i) is called 5 separate times
//   - EACH call gets its OWN execution context, and therefore
//     its OWN local "i" parameter — completely independent of
//     the outer loop's var i
//   - the setTimeout callback inside close() forms a closure over
//     THAT call's local "i", not the outer loop's shared "i"
//   - this manually recreates what `let` gives you automatically


/* ------------------------------------------------------------
   PART 5 RECURSIVE VERSION — NO LOOP AT ALL
   ------------------------------------------------------------
   A completely different approach: use recursion instead of a
   for loop, sidestepping the var/let scoping issue entirely.
   ------------------------------------------------------------ */

function printRecursive(n) {
  if (n == 0) return; // base case: stop recursing

  printRecursive(n - 1); // recursive call happens FIRST

  setTimeout(() => {
    console.log(n);
  }, n * 1000);
}
printRecursive(5);

/*
   WALKING THROUGH THE CALL STACK:

   printRecursive(5) called
     -> calls printRecursive(4) BEFORE registering its own setTimeout
        -> calls printRecursive(3) BEFORE registering its own setTimeout
           -> calls printRecursive(2) BEFORE registering its own setTimeout
              -> calls printRecursive(1) BEFORE registering its own setTimeout
                 -> calls printRecursive(0) -> n==0 -> returns immediately (base case)
                 -> NOW printRecursive(1) registers setTimeout(..., 1000)  [n=1]
              -> NOW printRecursive(2) registers setTimeout(..., 2000)     [n=2]
           -> NOW printRecursive(3) registers setTimeout(..., 3000)        [n=3]
        -> NOW printRecursive(4) registers setTimeout(..., 4000)           [n=4]
     -> NOW printRecursive(5) registers setTimeout(..., 5000)              [n=5]

   Each printRecursive(n) call is its OWN execution context with
   its OWN local "n" — exactly like the close(i) trick in Part 4,
   just achieved through recursion instead of an extra wrapper
   function. Each setTimeout closes over its call's own "n".

   Output: 1 (after 1 sec), 2 (after 2 sec), 3 (after 3 sec),
           4 (after 4 sec), 5 (after 5 sec)

   Notice there's no "hello"/synchronous log here since this
   version doesn't include one — but if you added
   console.log("hello") at the very top of printRecursive, it
   would print FIVE times (once per recursive call) since it's
   not guarded by the base case. Worth trying as an exercise!
*/


/* ------------------------------------------------------------
   QUICK RECAP — WHY THIS QUESTION IS AN INTERVIEW FAVORITE
   ------------------------------------------------------------
   It tests THREE concepts at once:

   1. setTimeout is non-blocking — the loop finishes completely
      before any callback runs
   2. var is function-scoped -> ONE shared variable across all
      iterations -> all closures see the FINAL value
   3. let is block-scoped -> a NEW variable per iteration -> each
      closure sees its OWN value

   Three valid fixes when stuck with var:
     a) switch to let                          (Part 3)
     b) manually wrap in a function -> new closure per call (Part 4)
     c) use recursion instead of a loop entirely (Part 7)
   ------------------------------------------------------------ */