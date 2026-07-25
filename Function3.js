/* ============================================================
   map(), filter(), reduce() — The Big Three Higher-Order
   Array Functions
   ============================================================
   */

/* ------------------------------------------------------------
   PART 1: Array.map() — TRANSFORM every element
   ------------------------------------------------------------
   Takes each element, runs your function on it, and returns a
   BRAND NEW array of the same length, with transformed values.
   Original array is NEVER modified.
   ------------------------------------------------------------ */

const numbers = [5, 1, 3, 2, 6];

// Doubling values
const doubled = numbers.map(function (num) {
  return num * 2;
});
console.log("Doubled:", doubled); // [10, 2, 6, 4, 12]

// Tripling values
const tripled = numbers.map(function (num) {
  return num * 3;
});
console.log("Tripled:", tripled); // [15, 3, 9, 6, 18]

// Converting numbers to binary strings
const binary = numbers.map(function (num) {
  return num.toString(2);
});
console.log("Binary:", binary); // ["101", "1", "11", "10", "110"]

console.log("Original array unchanged:", numbers); // [5, 1, 3, 2, 6]

/* ------------------------------------------------------------
   PART 2: Array.filter() — KEEP only elements matching a condition
   ------------------------------------------------------------
   Takes each element, runs your PREDICATE function (a function
   that returns true/false) on it, and returns a NEW array
   containing ONLY the elements where the function returned true.
   The new array can be shorter than the original.
   ------------------------------------------------------------ */

// Extracting odd numbers
const oddNumbers = numbers.filter(function (num) {
  return num % 2 !== 0;
});
console.log("Odd numbers:", oddNumbers); // [5, 1, 3]

// Filtering even numbers
const evenNumbers = numbers.filter(function (num) {
  return num % 2 === 0;
});
console.log("Even numbers:", evenNumbers); // [2, 6]

// Finding values greater than 4
const greaterThan4 = numbers.filter(function (num) {
  return num > 4;
});
console.log("Greater than 4:", greaterThan4); // [5, 6]

/*
   KEY DIFFERENCE FROM map():
     map()    -> SAME length output, TRANSFORMED values
     filter() -> POSSIBLY SHORTER output, ORIGINAL values kept
                 (just fewer of them)
*/

/* ------------------------------------------------------------
   PART 3: Array.reduce() — REDUCE the whole array to ONE value
   ------------------------------------------------------------
   The most flexible (and most confusing at first) of the three.
   It takes a function with TWO main things:
     (accumulator, currentElement) => ...
   and an OPTIONAL initial value for the accumulator.

   "accumulator" carries the running result FORWARD across every
   iteration — you decide what it becomes on each step, and
   whatever you return becomes the accumulator for the NEXT step.
   ------------------------------------------------------------ */

// Calculating the sum of an array
const sum = numbers.reduce(function (accumulator, currentValue) {
  return accumulator + currentValue;
}, 0); // 0 is the STARTING value of accumulator
console.log("Sum:", sum); // 17

/*
   WALKING THROUGH reduce() STEP BY STEP for the sum above:

   numbers = [5, 1, 3, 2, 6], starting accumulator = 0

   Step 1: accumulator=0, currentValue=5 -> return 0+5 = 5
   Step 2: accumulator=5, currentValue=1 -> return 5+1 = 6
   Step 3: accumulator=6, currentValue=3 -> return 6+3 = 9
   Step 4: accumulator=9, currentValue=2 -> return 9+2 = 11
   Step 5: accumulator=11, currentValue=6 -> return 11+6 = 17

   Final result: 17 (this becomes the return value of reduce itself)
*/

// Finding the maximum value
const max = numbers.reduce(function (accumulator, currentValue) {
  if (currentValue > accumulator) {
    return currentValue; // new max found, carry IT forward
  } else {
    return accumulator; // no change, keep carrying the old max forward
  }
}, 0);
console.log("Max:", max); // 6

// Counting occurrences of ages in an array of objects
const users = [
  { firstName: "Alok", lastName: "Raj", age: 23 },
  { firstName: "Ashish", lastName: "Kumar", age: 29 },
  { firstName: "Ankit", lastName: "Roy", age: 29 },
  { firstName: "Pranav", lastName: "Mukherjee", age: 23 },
];

const ageReport = users.reduce(function (acc, curr) {
  if (acc[curr.age]) {
    acc[curr.age] = acc[curr.age] + 1; // already seen this age, increment
  } else {
    acc[curr.age] = 1; // first time seeing this age
  }
  return acc; // MUST return the accumulator each time, or it becomes undefined
}, {}); // starting accumulator is an EMPTY OBJECT this time, not 0

console.log("Age report:", ageReport); // { '23': 2, '29': 2 }

/*
   NOTE: the accumulator doesn't have to be a number — here it's
   an OBJECT, being built up across iterations. This is why
   reduce() is so flexible: the accumulator can be a number, an
   object, an array, a string — whatever shape your final answer
   needs to be.
*/

/* ------------------------------------------------------------
   PART 4: CHAINING map(), filter(), and reduce() TOGETHER
   ------------------------------------------------------------
   Since map/filter both RETURN arrays, you can chain them: the
   output of one becomes the input for the next, right in one
   expression.
   ------------------------------------------------------------ */

// Get first names of users under 30
const firstNamesUnder30 = users
  .filter(function (user) {
    return user.age < 30;
  })
  .map(function (user) {
    return user.firstName;
  });

console.log("First names under 30:", firstNamesUnder30);
// ["Alok", "Ashish", "Ankit", "Pranav"] (all four are under 30 here)

/*
   HOW CHAINING WORKS, STEP BY STEP:

   1. users.filter(...) runs FIRST
        -> loops through all users, keeps only those with age < 30
        -> returns a NEW ARRAY of user objects (still full objects)
   2. .map(...) is then called ON THAT RESULT (not on the
      original "users" array)
        -> loops through the FILTERED array
        -> transforms each user object into JUST their firstName
        -> returns a NEW ARRAY of strings

   Each method in the chain gets the PREVIOUS method's return
   value as its own array to work on — that's the whole trick.
*/

/* ------------------------------------------------------------
   PART 5: SAME RESULT, USING ONLY reduce()
   ------------------------------------------------------------
 */

const firstNamesUnder30UsingReduce = users.reduce(function (acc, curr) {
  if (curr.age < 30) {
    // this replaces what filter() was doing — a manual condition check
    acc.push(curr.firstName); // this replaces what map() was doing — transform + collect
  }
  return acc; // always return the accumulator to carry it to the next iteration
}, []); // starting accumulator is an EMPTY ARRAY

console.log(
  "First names under 30 (via reduce only):",
  firstNamesUnder30UsingReduce,
);
// ["Alok", "Ashish", "Ankit", "Pranav"] -- SAME result as Part 4

/*
   WHY THIS WORKS — reduce() CAN DO EVERYTHING map/filter DO:

   - map()'s job (transform each element) = inside reduce, you
     compute the transformed value and push/store it into acc
   - filter()'s job (keep only some elements) = inside reduce,
     you wrap your push in an `if` condition, skipping elements
     that don't match

   This is WHY reduce() is considered the most POWERFUL of the
   three — technically, you can implement map() and filter()
   THEMSELVES using reduce() internally (this is a common
   follow-up interview question: "implement map using reduce").

   TRADE-OFF: doing it with only reduce() here is LESS readable
   than the clean two-step chain in Part 4. In real code, prefer
   whichever is clearest — chaining map/filter is usually more
   readable for simple cases; reduce shines when you need a
   SINGLE combined pass or a non-array result (like the age
   report object in Part 3).
*/

/* ------------------------------------------------------------
   BONUS: IMPLEMENTING map() USING reduce() (common interview Q)
   ------------------------------------------------------------ */

function mapUsingReduce(arr, mapperFn) {
  return arr.reduce(function (acc, curr) {
    acc.push(mapperFn(curr)); // apply the transform, collect the result
    return acc;
  }, []);
}

const doubledUsingReduce = mapUsingReduce(numbers, function (num) {
  return num * 2;
});
console.log("Doubled (via reduce-based map):", doubledUsingReduce); // [10, 2, 6, 4, 12]
// Same output as Part 1's "doubled" — proving map() is really
// just a specific, restricted use of the reduce() pattern.

/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. map()    -> transforms EVERY element, same-length output
   2. filter() -> keeps ONLY elements matching a condition,
                  possibly-shorter output
   3. reduce() -> combines the whole array into ONE final value
                  (number, object, array, string — anything),
                  using an accumulator that carries forward
                  across each step
   4. Chaining: .filter(...).map(...) works because each method
      returns a new array that the next method operates on
   5. reduce() is the most POWERFUL of the three — it can
      replicate what map() and filter() do, just less readably
      for simple cases
   6. Always return the accumulator from your reduce() callback,
      or it becomes undefined on the very next iteration
   ------------------------------------------------------------ */
