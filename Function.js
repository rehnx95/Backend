/* ============================================================
   FUNCTIONS IN JAVASCRIPT — Statements, Expressions,
   Anonymous Functions, Named Function Expressions,
   Parameters vs Arguments, First-Class Functions
   ============================================================ */


/* ------------------------------------------------------------
   PART 1: FUNCTION STATEMENT (a.k.a. FUNCTION DECLARATION)
   ------------------------------------------------------------
   Defined with the `function` keyword + a name, standalone.
   These are FULLY HOISTED — entire function body is stored in
   memory during the Memory Creation Phase, so you can call it
   before its definition appears in the code.
   ------------------------------------------------------------ */

console.log(sayHello()); // "Hello!" <-- works even though called BEFORE definition below

function sayHello() {
  return "Hello!";
}
// This is a FUNCTION STATEMENT. In the memory phase, "sayHello"
// already holds the ENTIRE function body, not just "undefined".


/* ------------------------------------------------------------
   PART 2: FUNCTION EXPRESSION
   ------------------------------------------------------------
   A function assigned to a variable. Since it's a var/let/const
   assignment, it's treated like ANY OTHER VARIABLE for hoisting
   purposes — memory phase gives it "undefined" (for var), and it
   can't be called until the actual assignment line executes.
   ------------------------------------------------------------ */

// console.log(sayBye()); // TypeError: sayBye is not a function
// (at this point, "sayBye" is just "undefined" in memory — you
//  cannot call undefined() as if it were a function)

var sayBye = function () {
  return "Bye!";
};

console.log(sayBye()); // "Bye!" <-- works fine NOW, after assignment has run

/*
   KEY DIFFERENCE:
     Function Statement -> entire function hoisted, callable anywhere
     Function Expression -> only the VARIABLE is hoisted (as undefined),
                             function itself only exists after that
                             line of code actually executes
*/


/* ------------------------------------------------------------
   PART 3: ANONYMOUS FUNCTIONS
   ------------------------------------------------------------
   A function with NO name. Only valid where a function is being
   used as a VALUE (assigned to a variable, passed as an argument,
   etc.) — not as a standalone statement.
   ------------------------------------------------------------ */

// valid: anonymous function used as a value (assigned to a variable)
var greet = function () {
  return "Anonymous function assigned to a variable";
};
console.log(greet());

// valid: anonymous function passed as a callback argument
setTimeout(function () {
  console.log("Anonymous function used as a callback");
}, 100);

// INVALID as a standalone statement:
// function () {
//   console.log("this breaks");
// }
// SyntaxError: Function statements require a function name
//
// WHY: a function STATEMENT must have a name, by definition.
// The parser sees `function () {...}` on its own and doesn't
// know what to do with an unnamed declaration — it's not being
// used as a value, so it's not a valid expression either.


/* ------------------------------------------------------------
   PART 4: NAMED FUNCTION EXPRESSIONS
   ------------------------------------------------------------
   Same as a function expression, but the function itself has a
   name. The GOTCHA: that internal name is ONLY visible inside
   the function's own scope — not in the outer scope where the
   expression was assigned.
   ------------------------------------------------------------ */

var myFunc = function xyz() {
  console.log("Inside xyz, called via myFunc()");
  // "xyz" IS accessible right here, inside its own function body
  // (useful for recursion, for example)
};

myFunc(); // works fine — "Inside xyz, called via myFunc()"

// console.log(xyz()); // ReferenceError: xyz is not defined
// WHY: "xyz" was never added to the OUTER scope's memory at all.
// It only exists within its own function's local scope. The
// outer world only knows this function by the variable name
// "myFunc" that it was assigned to.

// Practical use of the internal name -- self-referencing for recursion:
var factorial = function calculateFactorial(n) {
  if (n <= 1) return 1;
  return n * calculateFactorial(n - 1); // refers to itself by its OWN internal name
};
console.log(factorial(5)); // 120
// console.log(calculateFactorial(5)); // ReferenceError -- not accessible outside


/* ------------------------------------------------------------
   PART 5: PARAMETERS vs ARGUMENTS
   ------------------------------------------------------------ */

function add(x, y) {
  // x and y are PARAMETERS — placeholders/labels defined in the
  // function's own definition, local variables waiting for values
  return x + y;
}

console.log(add(3, 4));
// 3 and 4 here are ARGUMENTS — the actual real values passed in
// at the moment the function is INVOKED (called)

/*
   MEMORY TRICK:
     PARAMETERS  -> exist in the function's DEFINITION  ("what it expects")
     ARGUMENTS   -> exist at the function's CALL SITE    ("what you actually give it")
*/


/* ------------------------------------------------------------
   PART 6: FIRST-CLASS FUNCTIONS (FIRST-CLASS CITIZENS)
   ------------------------------------------------------------
   In JS, functions are treated just like any other value (a
   number, string, object). This means functions can be:
     1. Assigned to variables
     2. Passed as arguments to other functions
     3. Returned from other functions
   This is the foundation of functional programming in JS, and
   it's exactly what made closures, callbacks, and higher-order
   functions possible in everything you've learned so far.
   ------------------------------------------------------------ */

// 1. Assigned to a variable (you've already seen this above)
var multiply = function (a, b) {
  return a * b;
};
console.log(multiply(2, 5)); // 10

// 2. Passed as an argument into another function
function calculate(a, b, operationFn) {
  // "operationFn" is just a parameter here — it happens to hold a function
  return operationFn(a, b);
}
console.log(calculate(4, 5, multiply)); // 20
// "multiply" the FUNCTION ITSELF is passed in (no parentheses —
// we're not calling it here, we're passing the function as a value)

// 3. Returned from another function
function createMultiplier(factor) {
  // returns a NEW function — this also happens to form a closure
  // over "factor", tying back to everything in your earlier files
  return function (num) {
    return num * factor;
  };
}
var double = createMultiplier(2);
var triple = createMultiplier(3);
console.log(double(10)); // 20
console.log(triple(10)); // 30

/*
   THIS IS WHY CLOSURES AND CALLBACKS ARE EVEN POSSIBLE:
   - passing a function as an argument (step 2) is exactly what
     setTimeout(callback, delay) has been doing throughout your
     earlier files
   - returning a function from a function (step 3) is exactly
     the mechanism behind the module pattern, currying, and the
     `once()` factory from your closures file
   Functions being "first-class" is the underlying enabler for
   ALL of that — not a separate, unrelated concept.
*/


/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. Function Statement -> fully hoisted, name required, callable
      before its definition in the code
   2. Function Expression -> treated like a variable for hoisting;
      not callable until the assignment line actually executes
   3. Anonymous Function -> no name, valid only as a value
      (assigned to a variable / passed as an argument), invalid
      as a standalone statement
   4. Named Function Expression -> has a name, but that name is
      ONLY visible inside the function's own scope (handy for
      self-referencing recursion)
   5. Parameters (in the definition) vs Arguments (at the call site)
   6. First-Class Functions -> functions can be assigned to
      variables, passed as arguments, and returned from functions
      — this is what makes callbacks, closures, and higher-order
      functions possible
   ------------------------------------------------------------ */