/* ============================================================
   OBJECTS & ARRAYS — Declaration, Methods, Destructuring
   ============================================================
   These two data structures are what almost every backend
   response, request body, and database record looks like in
   JS. This file covers the practical toolkit you'll actually
   use constantly — not new concepts, but essential syntax.
   ============================================================ */


/* ================================================================
   SECTION A: OBJECTS
   ================================================================ */


/* ------------------------------------------------------------
   PART 1: CREATING OBJECTS
   ------------------------------------------------------------ */

// Object literal — the most common way
const user = {
  firstName: "Rehan",
  age: 20,
  isStudent: true,
};

// Empty object, add properties later
const emptyObj = {};
emptyObj.city = "unknown";

// Object.create() — creates an object with a specific prototype
// (rarely used directly day-to-day, but explains what's really
// happening under class/prototype-based objects)
const base = { greet: function () { console.log("Hi"); } };
const derived = Object.create(base);
derived.greet(); // "Hi" — inherited via the prototype chain


/* ------------------------------------------------------------
   PART 2: ACCESSING & MODIFYING PROPERTIES
   ------------------------------------------------------------ */

console.log(user.firstName); // dot notation — "Rehan"
console.log(user["firstName"]); // bracket notation — same result

// Bracket notation is REQUIRED when the key is dynamic (a variable)
const key = "age";
console.log(user[key]); // 20 -- user.key would look for a property literally named "key"

user.age = 21; // modify existing property
user.country = "India"; // add a new property
delete user.isStudent; // remove a property entirely

console.log(user); // { firstName: 'Rehan', age: 21, country: 'India' }


/* ------------------------------------------------------------
   PART 3: SHORTHAND PROPERTIES & COMPUTED KEYS
   ------------------------------------------------------------ */

const name = "Rehan";
const city = "Raipur";

// OLD WAY — repetitive
const person1 = { name: name, city: city };

// SHORTHAND — if the variable name matches the key name, skip repeating it
const person2 = { name, city };
console.log(person2); // { name: 'Rehan', city: 'Raipur' }

// Computed property names — key is a DYNAMIC expression
const propName = "favoriteColor";
const person3 = {
  name,
  [propName]: "blue", // key becomes "favoriteColor"
};
console.log(person3); // { name: 'Rehan', favoriteColor: 'blue' }

// Very common in backend code, e.g. building a dynamic filter object:
function buildFilter(field, value) {
  return { [field]: value };
}
console.log(buildFilter("status", "active")); // { status: 'active' }


/* ------------------------------------------------------------
   PART 4: OBJECT METHODS — keys, values, entries
   ------------------------------------------------------------ */

const product = { name: "Laptop", price: 50000, inStock: true };

console.log(Object.keys(product)); // ["name", "price", "inStock"]
console.log(Object.values(product)); // ["Laptop", 50000, true]
console.log(Object.entries(product));
// [["name", "Laptop"], ["price", 50000], ["inStock", true]]

// Object.entries() is extremely useful for looping with both key AND value:
for (const [key, value] of Object.entries(product)) {
  console.log(key + ":", value);
}
// name: Laptop
// price: 50000
// inStock: true

// Object.freeze() — makes an object IMMUTABLE (can't add/change/delete props)
const config = Object.freeze({ apiUrl: "https://api.example.com" });
config.apiUrl = "https://hacked.com"; // silently fails (or throws in strict mode)
console.log(config.apiUrl); // still "https://api.example.com"
// Common use: freezing constant configuration objects so nothing
// accidentally mutates them later in a large codebase.


/* ------------------------------------------------------------
   PART 5: MERGING OBJECTS — spread & Object.assign
   ------------------------------------------------------------ */

const defaults = { theme: "light", fontSize: 14 };
const userPrefs = { fontSize: 18 };

// Spread operator — creates a NEW object, later keys OVERWRITE earlier ones
const merged = { ...defaults, ...userPrefs };
console.log(merged); // { theme: 'light', fontSize: 18 }

// Object.assign() — same result, older syntax, still common in older code
const mergedOldWay = Object.assign({}, defaults, userPrefs);
console.log(mergedOldWay); // { theme: 'light', fontSize: 18 }

/*
   REAL BACKEND USE CASE: merging a default config with a request
   body's overrides — e.g. applying user-provided settings on top
   of sane defaults, without mutating the original defaults object.
*/


/* ------------------------------------------------------------
   PART 6: OBJECT DESTRUCTURING
   ------------------------------------------------------------
   Pulling specific properties OUT of an object into their own
   variables, in one line, instead of repeating object.property
   over and over.
   ------------------------------------------------------------ */

const employee = { name: "Alok", role: "Engineer", salary: 80000 };

// WITHOUT destructuring:
const empName = employee.name;
const empRole = employee.role;

// WITH destructuring — same result, one line:
const { name: employeeName, role } = employee;
console.log(employeeName, role); // "Alok" "Engineer"
// Note: renamed "name" to "employeeName" here to avoid clashing
// with the "name" variable declared earlier in this file — this
// is exactly what the `oldKey: newVariableName` syntax is for.

// Default values during destructuring — for properties that MIGHT be missing
const { department = "Unassigned" } = employee;
console.log(department); // "Unassigned" — since employee has no "department" key

// Nested destructuring
const order = {
  id: "ORD1",
  customer: { name: "Pranav", email: "pranav@example.com" },
};
const { customer: { name: customerName, email } } = order;
console.log(customerName, email); // "Pranav" "pranav@example.com"

// EXTREMELY common in backend function parameters — destructuring
// straight from a request body or a passed-in object:
function createUser({ username, password, email }) {
  console.log("Creating user:", username, email);
  // password intentionally not logged
}
createUser({ username: "rehan99", password: "secret", email: "r@example.com" });
// This is EXACTLY what you'll write constantly in Express:
//   function handler(req, res) {
//     const { username, password } = req.body;
//   }


/* ================================================================
   SECTION B: ARRAYS
   ================================================================ */


/* ------------------------------------------------------------
   PART 7: CREATING & ACCESSING ARRAYS (quick recap)
   ------------------------------------------------------------ */

const fruits = ["apple", "banana", "cherry"];
console.log(fruits[0]); // "apple" — zero-indexed
console.log(fruits.length); // 3
console.log(fruits[fruits.length - 1]); // "cherry" — last element


/* ------------------------------------------------------------
   PART 8: COMMON ARRAY METHODS BEYOND map/filter/reduce
   ------------------------------------------------------------
   You already covered map/filter/reduce in depth — these round
   out the toolkit you'll use just as often.
   ------------------------------------------------------------ */

const nums = [10, 20, 30, 40, 50];

// find() — returns the FIRST element matching a condition (or undefined)
const firstOver25 = nums.find(function (n) {
  return n > 25;
});
console.log(firstOver25); // 30

// findIndex() — same idea, but returns the INDEX instead of the value
const indexOver25 = nums.findIndex(function (n) {
  return n > 25;
});
console.log(indexOver25); // 2

// some() — true if AT LEAST ONE element matches
console.log(nums.some(function (n) { return n > 45; })); // true

// every() — true only if ALL elements match
console.log(nums.every(function (n) { return n > 5; })); // true
console.log(nums.every(function (n) { return n > 25; })); // false

// includes() — simple existence check
console.log(nums.includes(30)); // true
console.log(nums.includes(99)); // false

// sort() — MUTATES the original array! Sorts as STRINGS by default
const unsorted = [10, 2, 33, 4];
unsorted.sort();
console.log(unsorted); // [10, 2, 33, 4] -> WRONG for numbers, sorted as strings!

// correct numeric sort — pass a comparator function
const correctlySorted = [10, 2, 33, 4].sort(function (a, b) {
  return a - b; // ascending order
});
console.log(correctlySorted); // [2, 4, 10, 33]

// slice() — returns a NEW array, does NOT mutate the original
const original = [1, 2, 3, 4, 5];
const sliced = original.slice(1, 3); // start index 1, up to (not including) index 3
console.log(sliced); // [2, 3]
console.log(original); // [1, 2, 3, 4, 5] — unchanged

// splice() — MUTATES the original array, can insert/remove/replace
const toSplice = [1, 2, 3, 4, 5];
toSplice.splice(1, 2); // remove 2 elements starting at index 1
console.log(toSplice); // [1, 4, 5] — original array itself changed


/* ------------------------------------------------------------
   PART 9: ARRAY DESTRUCTURING
   ------------------------------------------------------------ */

const coordinates = [12.9, 77.6];
const [latitude, longitude] = coordinates;
console.log(latitude, longitude); // 12.9 77.6

// Skipping elements with commas
const [first, , third] = ["a", "b", "c"];
console.log(first, third); // "a" "c"  -- middle element skipped

// Default values
const [x = 0, y = 0] = [5];
console.log(x, y); // 5 0 -- y wasn't present, falls back to default

// Swapping variables — classic destructuring trick
let a = 1;
let b = 2;
[a, b] = [b, a];
console.log(a, b); // 2 1


/* ------------------------------------------------------------
   PART 10: SPREAD & REST — THE SAME "..." SYNTAX, OPPOSITE JOBS
   ------------------------------------------------------------ */

// SPREAD — expands an array/object OUT into individual elements
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log(combined); // [1, 2, 3, 4, 5, 6]

const copyOfArr1 = [...arr1]; // shallow copy, NOT the same reference
copyOfArr1.push(4);
console.log(arr1); // [1, 2, 3] -- original untouched
console.log(copyOfArr1); // [1, 2, 3, 4]

// REST — gathers remaining items TOGETHER into an array (opposite direction)
function sumAll(...numbers) {
  // "numbers" collects EVERY argument passed in, as an array
  return numbers.reduce(function (acc, curr) {
    return acc + curr;
  }, 0);
}
console.log(sumAll(1, 2, 3, 4)); // 10
console.log(sumAll(5, 10)); // 15

// Rest in destructuring — "the rest of the array/object"
const [head, ...tail] = [1, 2, 3, 4];
console.log(head); // 1
console.log(tail); // [2, 3, 4]

const { username, ...otherDetails } = { username: "rehan99", age: 20, city: "Raipur" };
console.log(username); // "rehan99"
console.log(otherDetails); // { age: 20, city: 'Raipur' }
// Common backend use: stripping ONE sensitive field (like a
// password) out of an object before sending the rest back:
function sanitizeUser({ password, ...safeUser }) {
  return safeUser; // password deliberately dropped
}
console.log(sanitizeUser({ username: "rehan99", password: "secret123", email: "r@x.com" }));
// { username: 'rehan99', email: 'r@x.com' }  -- password stripped out


/* ------------------------------------------------------------
   PART 11: ARRAY OF OBJECTS — THE SHAPE OF REAL BACKEND DATA
   ------------------------------------------------------------
   This is what an API response, a database query result, or a
   parsed request body almost always looks like in practice.
   ------------------------------------------------------------ */

const users = [
  { id: 1, name: "Alok", age: 23, active: true },
  { id: 2, name: "Ashish", age: 29, active: false },
  { id: 3, name: "Ankit", age: 29, active: true },
];

// Destructuring WHILE looping — extremely common pattern
for (const { name: userName, age } of users) {
  console.log(userName + " is " + age + " years old");
}

// Combine everything: filter -> map -> destructure, all in one flow
const activeUserNames = users
  .filter(({ active }) => active) // destructure directly in the parameter
  .map(({ name: userName }) => userName);
console.log(activeUserNames); // ["Alok", "Ankit"]

// find a specific user by id (extremely common lookup pattern)
function findUserById(userList, id) {
  return userList.find(function (u) {
    return u.id === id;
  });
}
console.log(findUserById(users, 2)); // { id: 2, name: 'Ashish', age: 29, active: false }


/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   OBJECTS:
   1. Dot vs bracket notation — bracket needed for dynamic keys
   2. Shorthand properties & computed keys ([expr]: value)
   3. Object.keys/values/entries() for inspecting an object
   4. Object.freeze() for immutability
   5. Spread {...obj} / Object.assign() for merging without mutating
   6. Destructuring pulls properties into variables, supports
      renaming, defaults, and nesting — used CONSTANTLY in
      function parameters (especially req.body in Express)

   ARRAYS:
   7. find/findIndex/some/every/includes for searching/checking
   8. sort() MUTATES and sorts as strings by default — always
      pass a comparator for numbers
   9. slice() (non-mutating) vs splice() (mutating) — easy to
      mix up, worth memorizing which is which
   10. Array destructuring, with skipping, defaults, and swapping
   11. Spread expands OUT (combine/copy), rest gathers IN
       (collect remaining args/properties) — same "..." syntax,
       opposite jobs, tell apart by WHERE it appears
   12. Arrays of objects are the real shape of backend data —
       filter/map/destructure combos are your daily toolkit
   ------------------------------------------------------------ */