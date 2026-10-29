/* ============================================================
   HIGHER-ORDER FUNCTIONS & FUNCTIONAL PROGRAMMING
   ============================================================
   Based directly on the example shown in the video (visible in
   your screenshot): calculating area, circumference, and
   diameter for an array of radius values.
   ============================================================ */


/* ------------------------------------------------------------
   PART 1: WHAT IS A HIGHER-ORDER FUNCTION?
   ------------------------------------------------------------
   A Higher-Order Function is any function that either:
     (a) takes another function as an argument, OR
     (b) returns a function from it

   This is ONLY possible because functions are FIRST-CLASS
   CITIZENS in JS — the same concept from your "Functions Deep
   Dive" file. Callbacks (from your callbacks file) are actually
   a SPECIFIC CASE of higher-order functions: any function that
   accepts a callback IS a higher-order function.
   ------------------------------------------------------------ */

// A higher-order function: takes another function ("callback") as an argument
function higherOrderExample(callback) {
  console.log("Before calling the callback");
  callback();
  console.log("After calling the callback");
}

higherOrderExample(function () {
  console.log("I am the callback function");
});

// A higher-order function: RETURNS a function
function anotherHigherOrderExample() {
  return function () {
    console.log("I am the returned function");
  };
}

var returnedFn = anotherHigherOrderExample();
returnedFn(); // "I am the returned function"


/* ------------------------------------------------------------
   PART 2: THE PROBLEM — REPETITIVE CODE (BAD APPROACH)
   ------------------------------------------------------------
   This mirrors the exact mistake shown in your screenshot:
   THREE separate functions, each looping over the SAME radius
   array, each doing almost IDENTICAL work — only the actual
   math inside the loop changes.
   ------------------------------------------------------------ */

const radius = [3, 1, 2, 4];

// calculates area for each radius — has its OWN loop
const area = function (radiusArr) {
  const output = [];
  for (let i = 0; i < radiusArr.length; i++) {
    output.push(Math.PI * radiusArr[i] * radiusArr[i]);
  }
  return output;
};

// calculates circumference for each radius — ANOTHER, near-identical loop
const circumference = function (radiusArr) {
  const output = [];
  for (let i = 0; i < radiusArr.length; i++) {
    output.push(2 * Math.PI * radiusArr[i]);
  }
  return output;
};

// calculates diameter for each radius — YET ANOTHER near-identical loop
const diameter = function (radiusArr) {
  const output = [];
  for (let i = 0; i < radiusArr.length; i++) {
    output.push(2 * radiusArr[i]);
  }
  return output;
};

console.log("Area:", area(radius));
console.log("Circumference:", circumference(radius));
console.log("Diameter:", diameter(radius));

/*
   THE PROBLEM WITH THIS:
   - The exact same loop structure (declare output, loop through
     radiusArr, push a computed value, return output) is written
     THREE separate times
   - If you find a bug in the LOOPING logic itself (e.g. an
     off-by-one error, or you want to switch from `for` to
     `for...of`), you'd have to fix it in THREE different places
   - This violates the DRY PRINCIPLE: Don't Repeat Yourself
   - As you add more calculations (e.g. volume, surface area),
     you'd keep copy-pasting the SAME loop over and over
*/


/* ------------------------------------------------------------
   PART 3: THE FIX — EXTRACT THE VARYING LOGIC, SHARE THE LOOP
   ------------------------------------------------------------
   Instead of repeating the loop, we write ONE generic function
   that handles "loop through radiusArr and collect results" —
   and let the CALLER decide what math to actually do, by
   passing in a function ("logic") that does just that one part.

   This is a HIGHER-ORDER FUNCTION: "calculate" takes another
   function as an argument.
   ------------------------------------------------------------ */

const calculate = function (radiusArr, logic) {
  const output = [];
  for (let i = 0; i < radiusArr.length; i++) {
    output.push(logic(radiusArr[i])); // delegate the ACTUAL math to "logic"
  }
  return output;
};

// each of these is now just the ONE piece of logic that differs —
// no loop duplicated anywhere
const areaLogic = function (r) {
  return Math.PI * r * r;
};

const circumferenceLogic = function (r) {
  return 2 * Math.PI * r;
};

const diameterLogic = function (r) {
  return 2 * r;
};

console.log("Area (refactored):", calculate(radius, areaLogic));
console.log("Circumference (refactored):", calculate(radius, circumferenceLogic));
console.log("Diameter (refactored):", calculate(radius, diameterLogic));

/*
   WHY THIS IS BETTER:
   - The LOOP exists in exactly ONE place: inside calculate()
   - Each "logic" function is small, focused, and does ONLY the
     math for ONE radius value — it doesn't know or care about
     looping, arrays, or anything else
   - Want to add volume? Just write a tiny volumeLogic function
     and call calculate(radius, volumeLogic) — no new loop needed
   - If you ever need to fix or optimize the LOOPING mechanism
     itself, you only touch calculate() — ONE place, not three
   - This is the essence of FUNCTIONAL PROGRAMMING: small, pure,
     reusable, independent units of logic, combined together
     rather than duplicated
*/

/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. Higher-Order Function = a function that takes a function
      as an argument, OR returns a function — made possible by
      first-class functions
   2. Callbacks (setTimeout, event listeners, etc.) are a SPECIFIC
      case of higher-order functions you've already been using
   3. DRY PRINCIPLE: don't repeat the same loop/logic in multiple
      functions — extract the varying part, share the common part
   4. Functional Programming = breaking logic into small, focused,
      reusable, independent functions, then composing them together
      (e.g. calculate(radius, areaLogic)) instead of duplicating
      entire blocks of logic
   5. Built-in methods like .map(), .filter(), .reduce() are all
      higher-order functions using this exact same pattern —
      understanding your OWN calculate() function demystifies them
   ------------------------------------------------------------ */