/* ============================================================
   THE "this" KEYWORD — Behavior Across Every Context
   ============================================================
   The core rule to hold onto throughout this whole file:
   "this" is NOT determined by WHERE a function is written
   (except for arrow functions) — it's determined by HOW a
   function is CALLED. This is called "runtime binding," and
   it's the single idea that explains every example below.
   ============================================================ */


/* ------------------------------------------------------------
   PART 1: "this" IN THE GLOBAL SPACE
   ------------------------------------------------------------ */

console.log(this);
// In a BROWSER: this === window  (the global object)
// In NODE.JS (running a file directly): this === module.exports
//   (an empty object {}), NOT the Node "global" object — a
//   common mix-up. Node wraps every file in a module wrapper
//   function, so top-level "this" refers to that module's
//   exports object, not the true global object.
// In a Node REPL specifically (`node` with no file), top-level
//   "this" DOES behave like the global object, since there's no
//   module wrapper there.

// The TRUE global object in Node, regardless of context:
console.log(global); // Node's actual global object (like window in browsers)


/* ------------------------------------------------------------
   PART 2: "this" INSIDE A REGULAR FUNCTION — STRICT VS NON-STRICT
   ------------------------------------------------------------ */

function showThisNonStrict() {
  console.log(this);
}
showThisNonStrict();
// NON-STRICT MODE (default):
//   In a BROWSER: this === window (due to "this substitution")
//   In NODE.JS: this === global object as well, in this exact case

("use strict");
function showThisStrict() {
  "use strict"; // enabling strict mode just for this function
  console.log(this);
}
showThisStrict();
// STRICT MODE: this === undefined
// No substitution happens — JS does NOT silently swap in the
// global object anymore; you get undefined exactly as-is.

/*
   "this SUBSTITUTION" EXPLAINED:
   In non-strict mode, if the value of "this" WOULD be undefined
   or null (like when you call a plain function with no object
   before the dot), JS SUBSTITUTES it with the global object
   instead. Strict mode disables this substitution entirely,
   leaving "this" as undefined — which is generally considered
   SAFER, since it surfaces bugs (like accidentally modifying
   global state) instead of silently allowing them.
*/


/* ------------------------------------------------------------
   PART 3: RUNTIME BINDING — "this" DEPENDS ON HOW YOU CALL IT
   ------------------------------------------------------------
   This is the CENTRAL rule of this entire file.
   ------------------------------------------------------------ */

function whoIsThis() {
  console.log(this);
}

const obj = { name: "myObj" };

whoIsThis(); // called PLAIN -> this = global object (or undefined in strict mode)
obj.myMethod = whoIsThis;
obj.myMethod(); // called AS A METHOD on obj -> this = obj

/*
   SAME EXACT FUNCTION, called two different ways, gives two
   COMPLETELY different values for "this". This proves: "this"
   is NOT fixed by where the function was DEFINED — it's decided
   fresh, EVERY TIME, by HOW the function is CALLED (what's to
   the LEFT of the dot at the call site, essentially).
*/


/* ------------------------------------------------------------
   PART 4: "this" INSIDE AN OBJECT'S METHOD
   ------------------------------------------------------------ */

const user = {
  username: "Rehan",
  greet: function () {
    console.log("Hello, " + this.username);
    // "this" refers to whatever object is BEFORE the dot when
    // this method is actually CALLED — here, that's "user"
  },
};

user.greet(); // "Hello, Rehan"
// Called as user.greet() -> this = user -> this.username = "Rehan"

const anotherUser = {
  username: "Akshay",
  greet: user.greet, // reusing the SAME function reference
};
anotherUser.greet(); // "Hello, Akshay"
// SAME function, but called as anotherUser.greet() this time
// -> this = anotherUser -> this.username = "Akshay"
// Reinforces Part 3: it's the CALL, not the definition, that matters.

// What happens if you "detach" the method and call it plainly?
const detachedGreet = user.greet;
// detachedGreet(); // "Hello, undefined" (non-strict) — "this" is
// now the global object, which has no "username" property


/* ------------------------------------------------------------
   PART 5: call(), apply(), bind() — MANUALLY SETTING "this"
   ------------------------------------------------------------
   These let you EXPLICITLY control what "this" should be for a
   given function call, regardless of how it's normally called —
   useful for "borrowing" a method from one object to use with
   another.
   ------------------------------------------------------------ */

const student1 = { name: "Alok", printName: function () {
  console.log(this.name);
}};
const student2 = { name: "Pranav" };

// call() — invokes the function IMMEDIATELY, with "this" set manually
student1.printName.call(student2); // "Pranav"
// student2 doesn't even HAVE its own printName method — we're
// "borrowing" student1's function and forcing "this" to be
// student2 for just this one call

// apply() — same idea as call(), but arguments are passed as an ARRAY
function introduce(greeting, punctuation) {
  console.log(greeting + ", I am " + this.name + punctuation);
}
introduce.call(student2, "Hi", "!"); // "Hi, I am Pranav!"       <- args listed individually
introduce.apply(student2, ["Hi", "!"]); // "Hi, I am Pranav!"    <- args as an array

// bind() — does NOT call the function immediately; instead, it
// RETURNS a brand new function with "this" PERMANENTLY locked in,
// which you can call later, as many times as you want
const introduceAsPranav = introduce.bind(student2, "Hey", "?");
introduceAsPranav(); // "Hey, I am Pranav?"  <-- called whenever YOU want later
introduceAsPranav(); // works again, "this" stays locked to student2 every time

/*
   QUICK COMPARISON:
     call(thisArg, arg1, arg2, ...)   -> calls immediately, args listed
     apply(thisArg, [arg1, arg2])     -> calls immediately, args as array
     bind(thisArg, arg1, arg2, ...)   -> does NOT call immediately,
                                          returns a new function for later
*/


/* ------------------------------------------------------------
   PART 6: "this" IN ARROW FUNCTIONS — NO OWN BINDING
   ------------------------------------------------------------
   Arrow functions do NOT get their own "this" at all. They
   LEXICALLY inherit "this" from whatever their SURROUNDING
   (enclosing) scope's "this" was AT THE TIME THEY WERE WRITTEN —
   exactly like how closures capture variables from their
   lexical environment (same underlying mechanism you already
   know from your closures files!).
   ------------------------------------------------------------ */

const arrowObj = {
  username: "Rehan",
  greetArrow: () => {
    console.log(this.username); // "this" here is NOT arrowObj!
  },
};
arrowObj.greetArrow(); // undefined (or errors in strict mode with no global "this")
// WHY: the arrow function was defined at the TOP LEVEL of this
// file (inside the object literal, but object literals don't
// create their OWN "this" scope) — so its "this" is whatever
// the ENCLOSING scope's "this" is, which here is the global
// object's "this" (or module.exports in Node) — NOT arrowObj.

// Arrow functions become genuinely useful for "this" INSIDE a
// REGULAR function, where they inherit THAT function's "this":
const arrowInsideMethod = {
  username: "Rehan",
  greet: function () {
    // "this" here IS arrowInsideMethod, because greet() is a
    // regular function called as arrowInsideMethod.greet()
    const innerArrow = () => {
      // this arrow function is LEXICALLY inside greet(), so it
      // inherits greet()'s "this" -> arrowInsideMethod
      console.log("Arrow inherits:", this.username);
    };
    innerArrow();
  },
};
arrowInsideMethod.greet(); // "Arrow inherits: Rehan"

/*
   PRACTICAL USE CASE: arrow functions are extremely common
   INSIDE methods/callbacks specifically BECAUSE they inherit
   "this" from their surrounding context — e.g. inside a
   setTimeout call within a method, where a REGULAR function
   would lose track of "this", but an arrow function preserves it:
*/

const timerObj = {
  username: "Rehan",
  delayedGreetBad: function () {
    setTimeout(function () {
      // REGULAR function passed to setTimeout -> called PLAINLY
      // by the browser/Node internals -> "this" is NOT timerObj!
      console.log("Bad:", this.username); // undefined
    }, 100);
  },
  delayedGreetGood: function () {
    setTimeout(() => {
      // ARROW function -> inherits "this" from delayedGreetGood
      // itself, which IS timerObj, since delayedGreetGood was
      // called as timerObj.delayedGreetGood()
      console.log("Good:", this.username); // "Rehan"
    }, 200);
  },
};
timerObj.delayedGreetBad();
timerObj.delayedGreetGood();


/* ------------------------------------------------------------
   PART 7: "this" INSIDE DOM ELEMENTS (BROWSER ONLY)
   ------------------------------------------------------------ */

/*
   Example (assumes this HTML exists):
     <button onclick="console.log(this)">Click Me</button>

   Inside an inline HTML event handler like onclick, "this"
   refers to the HTML ELEMENT ITSELF (the DOM node) that the
   event handler is attached to — clicking the button logs the
   <button> element.

   Same idea with addEventListener:
     document.getElementById("myBtn").addEventListener("click", function () {
       console.log(this); // the button DOM element
     });

   BUT — if you use an ARROW FUNCTION here instead:
     document.getElementById("myBtn").addEventListener("click", () => {
       console.log(this); // NOT the button! Inherits outer "this"
       // (likely window/module.exports), because arrow functions
       // don't get their own "this" from HOW they're called —
       // they inherit it lexically, same as Part 6
     });

   This is a REAL, common gotcha: use a REGULAR function for
   addEventListener when you need "this" to be the clicked
   element; use an ARROW function when you specifically WANT to
   inherit "this" from the surrounding code instead (e.g. to
   access a class instance's "this" from inside an event handler).
*/


/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. Global space: this = window (browser) / this = global
      object in a Node REPL (module.exports in a Node FILE)
   2. Inside a plain function call: this = global object
      (non-strict, via "this substitution") or undefined (strict)
   3. "this" is determined by HOW a function is CALLED (runtime
      binding), NOT where it was defined — the exact same
      function can have different "this" values on different calls
   4. Inside an object's method: this = the object the method
      was called ON (whatever's before the dot at the call site)
   5. call()/apply()/bind() let you EXPLICITLY set "this":
        call(thisArg, ...args)   -> calls immediately, args listed
        apply(thisArg, [args])   -> calls immediately, args as array
        bind(thisArg, ...args)   -> returns a new function for later
   6. Arrow functions have NO "this" of their own — they
      LEXICALLY inherit "this" from their enclosing scope,
      exactly like closures inherit variables
   7. Inside DOM event handlers: this = the HTML element the
      handler is attached to (for regular functions; arrow
      functions inherit outer "this" instead)
   ------------------------------------------------------------ */