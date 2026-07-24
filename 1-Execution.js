/*
   PART 1: EXECUTION CONTEXT — TWO PHASES

   Every time JS runs code, it creates an Execution Context (EC):
     - Memory Component  (Variable Environment)
     - Code Component    (runs line by line)

   This happens in TWO phases:
     Phase 1: Memory Creation  -> scan code, allocate memory
     Phase 2: Code Execution   -> run line by line, assign values
*/

console.log(a); // undefined  <-- NOT an error!
console.log(getName()); // "Namaste JavaScript" <-- works before definition!

var a = 7;

function getName() {
  console.log("Namaste JavaScript");
}

/*
   WHY does this work?

   MEMORY CREATION PHASE (before any line actually runs):
     JS scans the whole file first and sets up memory:
       a         -> undefined              (var gets placeholder)
       getName   -> entire function code   (function declarations stored fully)

   CODE EXECUTION PHASE (now it runs line by line):
     console.log(a)         -> a is already undefined in memory -> prints undefined
     console.log(getName()) -> getName already has full code in memory -> runs it
     var a = 7               -> NOW a is actually assigned 7
     function getName(){...} -> already in memory, this line is just the definition site

   This "scan first, run second" behavior is what people call HOISTING.
*/

/*
   PART 2: HOISTING — var vs function vs undeclared
*/

// console.log(x); // ReferenceError: x is not defined
// x was NEVER declared anywhere -> no memory allocated for it at all -> error

console.log(b); // undefined
var b = 10;
// b WAS declared with var -> memory allocated as undefined during phase 1
// so accessing it early doesn't error, it just gives the placeholder value

// console.log(sum(2, 3)); // works fine
function sum(x, y) {
  // function DECLARATION -> entire function body copied into memory in phase 1
  return x + y;
}

// console.log(multiply(2, 3)); // TypeError: multiply is not a function
var multiply = function (x, y) {
  // this is a function EXPRESSION assigned to a var
  // in phase 1, "multiply" is treated like any other var -> starts as undefined
  // calling undefined() -> TypeError, NOT ReferenceError
  return x * y;
};

// console.log(divide(2, 1)); // same issue as above
var divide = (x, y) => x / y;
// arrow function assigned to var -> also just "undefined" until this line runs

/*
   PART 3: CALL STACK — how function calls are tracked

   - Global Execution Context (GEC) is created first, pushed to
     the bottom of the stack.
   - Every function call PUSHES a new Execution Context on top.
   - When a function returns, its EC is POPPED off the stack.
   - Program ends -> stack becomes empty.
*/

function a() {
  console.log("Inside a()");
  b(); // calling b() from inside a()
  console.log("Back in a(), after b() returned");
}

function b() {
  console.log("Inside b()");
}

a();

/*
   CALL STACK TRACE for the code above:

   Step 1: GEC pushed                     -> [ GEC ]
   Step 2: a() is called, EC(a) pushed     -> [ GEC, a() ]
   Step 3: inside a(), b() is called       -> [ GEC, a(), b() ]
   Step 4: b() finishes, popped off        -> [ GEC, a() ]
   Step 5: a() finishes, popped off        -> [ GEC ]
   Step 6: program ends, GEC popped        -> [ ]  (empty stack)

   Output order:
     Inside a()
     Inside b()
     Back in a(), after b() returned
*/

/*
   PART 4: RETURN STATEMENT & EC DELETION
*/

function square(n) {
  var result = n * n;
  return result;
  // as soon as return runs:
  //   1. control + value goes back to whoever called square()
  //   2. square()'s own Execution Context is deleted (popped)
  console.log("This line never runs"); // unreachable, EC already gone
}

var output = square(5);
console.log(output); // 25

/*
   PART 5: EACH FUNCTION CALL = ISOLATED LOCAL MEMORY

   Same variable name in different function calls do NOT clash,
   because each call gets its own fresh Execution Context /
   Variable Environment.
*/

function counter() {
  var count = 0; // lives ONLY inside this call's local memory
  count = count + 1;
  console.log(count);
}

counter(); // 1  -> fresh EC, fresh "count"
counter(); // 1  -> a BRAND NEW EC, previous "count" is gone (its EC was deleted)
counter(); // 1  -> again, totally independent

/*
   PART 6: LEXICAL ENVIRONMENT & SCOPE CHAIN

   Every Execution Context has a Lexical Environment:
     local memory  +  reference to PARENT's lexical environment

   "Lexical" = based on WHERE the function is physically written
   in the code, not where it's called from.

   Scope Chain = the path JS walks (local -> parent -> ... -> global)
   when looking up a variable that isn't found locally.
*/

function outer() {
  var outerVar = "I am from outer()";

  function inner() {
    // inner() is lexically INSIDE outer(), so outer() is its parent
    var innerVar = "I am from inner()";

    console.log(innerVar); // found locally, no need to search further
    console.log(outerVar); // not found locally -> walk up scope chain -> found in outer()
    console.log(globalVar); // not found locally, not in outer() -> found in global scope
  }

  inner();
}

var globalVar = "I am global";
outer();

/*
   SCOPE CHAIN LOOKUP for `outerVar` inside inner():
     1. Check inner()'s local memory      -> not found
     2. Check inner()'s parent (outer())  -> FOUND -> stop here

   SCOPE CHAIN LOOKUP for `globalVar` inside inner():
     1. Check inner()'s local memory      -> not found
     2. Check outer()'s local memory      -> not found
     3. Check global scope                -> FOUND -> stop here

   If it's not found even in global scope (whose parent is null):
     -> ReferenceError: variable is not defined
*/

/*
   PART 7: PUTTING IT ALL TOGETHER — ONE COMBINED EXAMPLE
*/

function calculateArea(radius) {
  var pi = 3.14; // local to calculateArea's EC

  function multiplyByPi(r) {
    // multiplyByPi is lexically inside calculateArea
    // so it can access "pi" via the scope chain, even though
    // "pi" is not declared inside multiplyByPi itself
    return pi * r * r;
  }

  return multiplyByPi(radius);
}

console.log(calculateArea(5)); // 78.5

/*
   WHAT HAPPENS STEP BY STEP:

   1. calculateArea(5) called
        -> GEC still at bottom of stack
        -> new EC created for calculateArea, PUSHED
        -> memory phase: pi -> undefined, multiplyByPi -> full function code, radius -> 5
        -> execution phase: pi assigned 3.14

   2. multiplyByPi(radius) called from inside calculateArea
        -> new EC created for multiplyByPi, PUSHED on top
        -> its lexical environment points back to calculateArea's environment
        -> "pi" not found locally -> scope chain walks up -> finds pi = 3.14 in parent
        -> computes 3.14 * 5 * 5 = 78.5
        -> return -> value sent back, multiplyByPi's EC POPPED off stack

   3. calculateArea returns 78.5 -> its own EC POPPED off stack

   4. console.log prints 78.5, GEC remains until program ends

   Call stack visualization:
     [ GEC ]
     [ GEC, calculateArea() ]
     [ GEC, calculateArea(), multiplyByPi() ]
     [ GEC, calculateArea() ]              <- multiplyByPi popped after return
     [ GEC ]                               <- calculateArea popped after return
     [ ]                                    <- program ends
*/
