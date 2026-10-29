/*
   DEFINITION: A closure is a function bundled together with
   its lexical environment. The function "remembers" the
   variables from the scope it was created in, even after that
   outer scope has finished executing.
*/

/*
    PART 1: THE BASIC CLOSURE
*/

function outer() {
  var a = 10; // "a" lives in outer()'s lexical environment

  function inner() {
    console.log(a); // inner() USES "a" but doesn't own it
  }

  return inner; // we return the FUNCTION ITSELF (not calling it)
}

var closureFn = outer(); // outer() runs and finishes completely, EC popped
closureFn(); // 10  <-- still works! HOW?

/*
   WHY does this still work after outer() has already returned
   and its Execution Context was popped off the call stack?

   Because when inner() was created, it didn't just grab the
   VALUE of "a". It formed a CLOSURE: inner() + a reference to
   outer()'s entire lexical environment.

   So even though outer()'s EC is gone from the call stack,
   the variable "a" is NOT garbage collected, because inner()
   (now stored in closureFn) still holds a live reference to it.

   This is the core idea: closure = function + its lexical scope,
   preserved in memory as long as something can still reach it.
*/

/*
   PART 2: CLOSURES HOLD A REFERENCE, NOT JUST A SNAPSHOT VALUE
*/

function outerCounter() {
  var count = 0;

  function incrementAndLog() {
    count = count + 1; // modifying the SAME "count" every time
    console.log(count);
  }

  return incrementAndLog;
}

var myCounter = outerCounter();
myCounter(); // 1
myCounter(); // 2
myCounter(); // 3
// count is NOT reset to 0 each call — the closure keeps a live
// reference to the SAME "count" variable across every call.

var anotherCounter = outerCounter(); // a brand new "count" is created here
anotherCounter(); // 1  <-- independent from myCounter's count
myCounter(); // 4      <-- myCounter's own count keeps going separately

/*
   PART 3: NESTED CLOSURES — MULTIPLE LEVELS OF SCOPE
*/

function grandparent() {
  var g = "grandparent-var";

  function parent() {
    var p = "parent-var";

    function child() {
      var c = "child-var";
      // child() can access ALL of these via the scope chain,
      // even though only "c" belongs to child() itself
      console.log(c, p, g);
    }

    return child;
  }

  return parent();
}

var deepClosure = grandparent();
deepClosure(); // "child-var parent-var grandparent-var"
// grandparent() and parent() have BOTH already finished executing
// and been popped off the call stack — yet child() still reaches
// their variables through the chain of closures.

/* ------------------------------------------------------------
   PART 4: PRACTICAL USE CASE #1 — A "RUN ONCE" FUNCTION FACTORY
   ------------------------------------------------------------
   Common interview/real-world pattern: a function that should
   only ever execute its core logic ONE time, no matter how many
   times it's called afterward.
   ------------------------------------------------------------ */

function once(fn) {
  var hasRun = false; // private state, hidden from outside — only
  var result; // "once"'s returned function can touch it

  return function (...args) {
    if (!hasRun) {
      result = fn(...args); // run the real logic only the first time
      hasRun = true;
    }
    return result; // subsequent calls just return the cached result
  };
}

function expensiveSetup() {
  console.log("Running expensive setup...");
  return "setup complete";
}

var setupOnce = once(expensiveSetup);
setupOnce(); // logs "Running expensive setup..." -> returns "setup complete"
setupOnce(); // does NOT log anything again -> just returns "setup complete"
setupOnce(); // same -> cached result returned instantly

/*
   "hasRun" and "result" are NOT accessible from outside once().
   They're only reachable through the closure formed by the
   returned inner function. This is real, practical encapsulation.
*/

/* ------------------------------------------------------------
   PART 5: PRACTICAL USE CASE #2 — MODULE PATTERN
   ------------------------------------------------------------
   Closures let you create "private" variables that can only be
   read or changed through specific exposed functions — similar
   to private fields in a class.
   ------------------------------------------------------------ */

function createBankAccount(initialBalance) {
  var balance = initialBalance; // private — no outside code can touch this directly

  return {
    deposit: function (amount) {
      balance = balance + amount;
      console.log("Deposited:", amount, "| New balance:", balance);
    },
    withdraw: function (amount) {
      if (amount > balance) {
        console.log("Insufficient funds!");
        return;
      }
      balance = balance - amount;
      console.log("Withdrew:", amount, "| New balance:", balance);
    },
    checkBalance: function () {
      console.log("Current balance:", balance);
    },
  };
}

var myAccount = createBankAccount(100);
myAccount.deposit(50); // Deposited: 50 | New balance: 150
myAccount.withdraw(30); // Withdrew: 30 | New balance: 120
myAccount.checkBalance(); // Current balance: 120

// console.log(myAccount.balance); // undefined -- "balance" is NOT
// directly accessible from outside. The only way to interact with
// it is through deposit/withdraw/checkBalance, each of which forms
// its own closure over the SAME "balance" variable.

/* ------------------------------------------------------------
   PART 6: PRACTICAL USE CASE #3 — CURRYING
   ------------------------------------------------------------
   Currying = transforming a function that takes multiple
   arguments into a series of functions that each take one
   argument, using closures to "remember" earlier arguments.
   ------------------------------------------------------------ */

function multiply(a) {
  return function (b) {
    // this inner function forms a closure over "a"
    return a * b;
  };
}

var multiplyBy2 = multiply(2); // "a" is now permanently 2 for this closure
console.log(multiplyBy2(5)); // 10  (2 * 5)
console.log(multiplyBy2(10)); // 20  (2 * 10)

var multiplyBy10 = multiply(10); // a fresh closure, "a" = 10 here
console.log(multiplyBy10(5)); // 50  (10 * 5)

// multiplyBy2 and multiplyBy10 each hold their OWN closure over
// a DIFFERENT value of "a" — the returned function is what keeps
// that isolated memory alive after multiply() itself has finished.

/* ------------------------------------------------------------
   PART 7: GARBAGE COLLECTION & CLOSURES
   ------------------------------------------------------------ */

function withUnusedVar() {
  var used = "I am captured by the closure";
  var unused = "I am NOT referenced by anything returned";

  return function () {
    console.log(used);
  };
}

var fn = withUnusedVar();
fn(); // "I am captured by the closure"

/*
   "used" stays alive in memory because the returned function
   still references it — the garbage collector can't clean it up.

   "unused" is NOT referenced by the returned function at all.
   Modern JS engines (like V8) are smart enough to garbage collect
   "unused" even though it's technically in the same outer scope,
   because nothing reachable from the outside still needs it.

   TAKEAWAY: closures don't keep the ENTIRE outer scope alive
   forever — only the parts still being referenced by something
   that's still reachable.
*/

/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. Closure = function + reference to its lexical environment
   2. Formed automatically whenever a function is defined inside
      another function (and especially clear when it's returned
      or passed out of that scope)
   3. Holds LIVE REFERENCES, not frozen snapshots of values
   4. Powers: data privacy/encapsulation (module pattern),
      run-once functions, currying, memoization, event handlers,
      setTimeout callbacks, and more
   5. Only variables actually still referenced are kept alive by
      the garbage collector — not the whole outer scope blindly
   ------------------------------------------------------------ */
