/* ================================================================
   ASSIGNMENT 1 — Execution Context, Hoisting, Closures, this
   ================================================================
   Topics tested: hoisting, execution context order, closures,
   "this" binding, call/apply/bind

   TASK:
   Without running this code, WRITE DOWN what you think each
   console.log will print, and WHY. Then run it and check.

   function mystery() {
     console.log(a);
     console.log(getValue());
     var a = 10;

     function getValue() {
       return a * 2;
     }
   }
   mystery();

   const obj = {
     value: 100,
     getValue: function () {
       return this.value;
     },
   };

   const detached = obj.getValue;
   console.log(obj.getValue());
   console.log(detached());
   console.log(detached.call(obj));

   function makeAdder(x) {
     return function (y) {
       return x + y;
     };
   }
   const add5 = makeAdder(5);
   console.log(add5(3));
   console.log(add5(10));

   ---------------------------------------------------------------
   THEN, BUILD THIS FROM SCRATCH (no copying):

   Write a function `createBudgetTracker(startingBalance)` that
   returns an object with THREE methods:
     - spend(amount)   -> subtracts from balance, returns new balance
     - add(amount)     -> adds to balance, returns new balance
     - getBalance()    -> returns current balance

   Requirements:
     - "balance" must be PRIVATE — no way to access or modify it
       except through the three methods (use a closure, not an
       object property)
     - Create TWO separate trackers and prove they don't interfere
       with each other's balance
   ================================================================ */

/*
//    CORRECTED PREDICTIONS:
//    undefined
//    NaN                  <- MISTAKE: you predicted 20. Hoisting only
//                            allocates memory (undefined) during the
//                            memory phase — it does NOT run the
//                            assignment early. When getValue() runs,
//                            "a" is STILL undefined (the "var a = 10"
//                            line hasn't executed yet), so
//                            undefined * 2 = NaN, not 20.
//    100
//    undefined            <- detached() called with no object before
//                            the dot -> "this" is NOT obj -> this.value
//                            is undefined (or throws in strict mode)
//    100                  <- .call(obj) forces "this" back to obj
//    8
//    15
// */

// function mystery() {
//   console.log(a); // undefined
//   console.log(getValue()); // NaN — see explanation above
//   var a = 10;

//   function getValue() {
//     return a * 2;
//   }
// }
// mystery();

// const obj = {
//   value: 100,
//   getValue: function () {
//     return this.value;
//   },
// };
// const detached = obj.getValue;
// console.log(obj.getValue()); // 100
// console.log(detached()); // undefined (or error) — called plainly, no "this"
// console.log(detached.call(obj)); // 100 — "this" manually restored

// function makeAdder(x) {
//   return function (y) {
//     return x + y;
//   };
// }
// const add5 = makeAdder(5);
// console.log(add5(3)); // 8
// console.log(add5(10)); // 15

// /* ------------------------------------------------------------
//    SUMMARY OF THE ACTUAL PATTERNS TO INTERNALIZE
//    ------------------------------------------------------------
//    1. Hoisting gives UNDEFINED at the memory phase, not the
//       eventual value — don't assume a variable "already has its
//       value" just because it was declared earlier in the file
//    2. map() must RETURN something per element — if you're just
//       doing a side effect (like printing), use forEach() instead
//    3. Once an async function's try/catch handles an error, the
//       function's OWN returned promise is no longer rejected —
//       outside .catch() chains won't fire anymore after that
//    4. Name variables after what they actually hold, not what
//       you plan to extract from them later
//    5. A closure's private variable and a function's PARAMETER can
//       have similar names but are completely different variables —
//       don't assume touching one affects the other
//    6. Logging a promise directly shows "Promise {<pending>}" —
//       always await it or chain .then() before expecting the
//       resolved value
//    ------------------------------------------------------------ */

/* ================================================================
   ASSIGNMENT 2 — Event Loop, setTimeout, Callbacks, Closures
   ================================================================
   Topics tested: event loop ordering, microtask vs macrotask,
   closures in loops, callback patterns

   TASK 1 — PREDICT THE EXACT OUTPUT ORDER before running:

   console.log("1");

   setTimeout(() => console.log("2"), 0);

   Promise.resolve().then(() => console.log("3"));

   for (var i = 0; i < 3; i++) {
     setTimeout(() => console.log("var loop:", i), 100);
   }

   for (let j = 0; j < 3; j++) {
     setTimeout(() => console.log("let loop:", j), 200);
   }

   console.log("4");

   Promise.resolve().then(() => console.log("5"));

   ---------------------------------------------------------------
   TASK 2 — BUILD FROM SCRATCH:

   Write a function `delayedSequence(items)` that takes an array
   of strings and prints each one to the console, ONE SECOND APART,
   IN ORDER (item[0] at 1s, item[1] at 2s, item[2] at 3s, etc.) —
   using ONLY setTimeout and a loop (no async/await for this one,
   that's the next assignment's job).

   Test it with: delayedSequence(["first", "second", "third"]);

   Think carefully about var vs let before you start.
   ================================================================ */

/*
// 1
// 4
// 3
// 5
// 2
// var loop:3
// var loop:3
// var loop:3
// let loop:0
// let loop:1
// let loop:2
// first console log then promise then settimeout with 0 second then var loop then let loop
// */
// function delayedSequence(items) {
//   for (let i = 0; i < items.length; i++) {
//     setTimeout(() => {
//       console.log(`items[${i}] at ${i}s time is ${new Date().toTimeString()}`);
//     }, i * 1000);
//   }
// }
// let arr=["item1","item2","item3","item4","item5",]
// delayedSequence(arr);


/* ================================================================
   ASSIGNMENT 3 — Promises, async/await, Promise APIs
   ================================================================
   Topics tested: promise creation, chaining, error handling,
   async/await, Promise.all/race/any

   SETUP (you may copy this part, it's just test scaffolding):

   function fetchUser(id) {
     return new Promise((resolve, reject) => {
       setTimeout(() => {
         if (id <= 0) {
           reject(new Error("Invalid user id"));
         } else {
           resolve({ id, name: "User" + id });
         }
       }, 500);
     });
   }

   function fetchOrders(userId) {
     return new Promise((resolve) => {
       setTimeout(() => {
         resolve(["order1", "order2", "order3"]);
       }, 300);
     });
   }

   ---------------------------------------------------------------
   TASK — BUILD FROM SCRATCH, using async/await and try/catch:

   Write an async function `getUserWithOrders(id)` that:
     1. Fetches the user using fetchUser(id)
     2. THEN fetches that user's orders using fetchOrders(user.id)
     3. Returns a combined object: { ...user, orders }
     4. If fetchUser rejects (invalid id), catch the error and
        return null instead of throwing

   Test it with BOTH a valid id (e.g. 5) and an invalid one (e.g. -1)
   and log both results.

   ---------------------------------------------------------------
   BONUS — do the SAME thing again, but using .then()/.catch()
   chaining instead of async/await. Compare how much longer/shorter
   it is.

   ---------------------------------------------------------------
   TASK 2 — Promise.all() usage:

   Write a function `getMultipleUsers(ids)` that takes an array of
   ids (e.g. [1, 2, 3]) and fetches ALL of them IN PARALLEL using
   fetchUser(), returning an array of user objects once ALL are
   done. Use Promise.all() — do NOT use a for loop with await
   (that would be sequential, not parallel — think about why).
   ================================================================ */

// function fetchUser(id) {
//   return new Promise(function (resolve, reject) {
//     setTimeout(() => {
//       if (id <= 0) {
//         reject(new Error("Invalid User"));
//       } else {
//         resolve({ id: id, name: "user " + id });
//       }
//     }, 500); 
//   });
// }

// function fetchOrders(userId, orderList) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({ id: userId, orders: orderList });
//     }, 300); 
//   });
// }

// async function getUserWithOrders(id, orderList) {
//   try {
//     const user = await fetchUser(id);
//     // MISTAKE (your version): you named this "userId" even though
//     // it holds the WHOLE user object ({ id, name }), not just the
//     // id. This is exactly how naming bugs hide in real code — later
//     // someone (or future you) reads "userId.name" and gets
//     // confused about what's actually stored there. Name variables
//     // after what they actually ARE, not after what you expect to
//     // extract from them later.
//     const orderData = await fetchOrders(user.id, orderList);
//     return { user, orders: orderData.orders };
//   } catch (err) {
//     console.log(err.message);
//     // MISTAKE (your version): you logged the error here, but the
//     // function then returns undefined implicitly (no return
//     // statement in the catch block). The assignment specifically
//     // asked for the function to return null on failure, so that
//     // WHOEVER CALLS this function can reliably check
//     // "if (result === null)" instead of getting an unpredictable
//     // undefined that might be confused with "not yet resolved."
//     return null;
//   }
// }

// const orderList = ["order1", "order2", "order3"];

// // valid id:
// getUserWithOrders(5, orderList).then((result) => {
//   console.log("Valid id result:", result);
// });

// // invalid id:
// getUserWithOrders(-2, orderList).then((result) => {
//   // MISTAKE (your version): you chained BOTH .then() AND .catch()
//   // onto fetchans(), expecting .catch() to fire on failure. But
//   // your try/catch INSIDE the async function already caught the
//   // rejection — by the time .then()/.catch() run on the OUTSIDE,
//   // the promise has already resolved successfully (with the value
//   // "undefined", or now "null" after the fix), so .catch() never
//   // fires. Once an error is caught INSIDE an async function, the
//   // async function's own returned promise is no longer rejected —
//   // it's just resolved with whatever the catch block returns.
//   console.log("Invalid id result:", result); // null
// });


/* ================================================================
   ASSIGNMENT 4 — Higher-Order Functions, map/filter/reduce, Objects
   ================================================================
   Topics tested: HOFs, array methods, destructuring, object methods

   SETUP (copy this data):

   const products = [
     { id: 1, name: "Laptop", price: 55000, category: "electronics", inStock: true },
     { id: 2, name: "Desk", price: 8000, category: "furniture", inStock: false },
     { id: 3, name: "Mouse", price: 500, category: "electronics", inStock: true },
     { id: 4, name: "Chair", price: 4500, category: "furniture", inStock: true },
     { id: 5, name: "Monitor", price: 12000, category: "electronics", inStock: false },
   ];

   ---------------------------------------------------------------
   Solve EACH of these separately, writing your own code (no
   looking at your map/filter/reduce file while attempting):

   1. Get an array of just the NAMES of products that are inStock.
      (chain filter + map)

   2. Get the TOTAL price of all electronics (inStock or not).
      (filter + reduce)

   3. Group all products by category into an object shaped like:
      { electronics: [...], furniture: [...] }
      (use reduce — this is the hardest one, take your time)

   4. Find the single MOST EXPENSIVE product. Return the whole
      product object, not just the price. (reduce)

   5. Write your OWN version of a "custom higher-order function"
      called `summarize(products, logic)` that loops through the
      products array and applies "logic" to each one, collecting
      results — basically rebuild the calculate(radius, logic)
      pattern from scratch, but for this products array. Then use
      it to extract just the ids of all products.
   ================================================================ */

// const products = [
//   {
//     id: 1,
//     name: "Laptop",
//     price: 55000,
//     category: "electronics",
//     inStock: true,
//   },
//   { id: 2, name: "Desk", price: 8000, category: "furniture", inStock: false },
//   { id: 3, name: "Mouse", price: 500, category: "electronics", inStock: true },
//   { id: 4, name: "Chair", price: 4500, category: "furniture", inStock: true },
//   {
//     id: 5,
//     name: "Monitor",
//     price: 12000,
//     category: "electronics",
//     inStock: false,
//   },
// ];

// const inStockNames = products
//   .filter((p) => p.inStock === true)
//   .map((p) => p.name);
//   // MISTAKE (your version): your .map() callback did
//   // `console.log(y.name)` but had NO return statement — so map()
//   // collected "undefined" for every item (since a function with no
//   // explicit return gives back undefined). map() is for
//   // TRANSFORMING each element into something new that you RETURN;
//   // if you just want to print each one as a side effect with no
//   // new array needed, that's what forEach() is for, not map().
// console.log(inStockNames); // ["Laptop", "Mouse", "Chair"]

// const totalprice = products
//   .filter((x) => x.inStock === true)
//   .reduce((acc, curr) => {
//     return acc + curr.price;
//   }, 0);
// console.log(totalprice);

// const Group = products.reduce(
//   (acc, curr) => {
//     if (curr.category === "electronics") {
//       acc.electronics.push(curr);
//     } else {
//       acc.furniture.push(curr);
//     }
//     return acc;
//   },
//   { electronics: [], furniture: [] },
// );
// console.log(Group);

// const expensive = products.reduce((acc, curr) => {
//   if (curr.price > acc) {
//     return curr;
//   } else {
//     return acc;
//   }
// }, products[0]);
// console.log(expensive);


/* ================================================================
   ASSIGNMENT 5 — Everything Combined: A Mini "Backend-Style" Task
   ================================================================
   Topics tested: closures, async/await, promises, HOFs, objects,
   destructuring, error handling — this simulates a tiny slice
   of what an actual Express route handler does

   TASK — BUILD FROM SCRATCH:

   Simulate a simple in-memory "database" and a request handler
   for it.

   1. Write a function `createUserStore()` that uses a CLOSURE to
      hold a private array of users (starts empty). It should
      return an object with these methods:
        - addUser({ name, email })  -> adds a user with an
          auto-incrementing id (starts at 1), returns the created
          user object
        - getUserById(id)           -> returns the user, or
          undefined if not found
        - getAllUsers()             -> returns ALL users
        - deleteUser(id)            -> removes the user with that
          id, returns true if something was deleted, false if not

   2. Write an async function `simulateSignup(store, userData)`
      that:
        - Uses a setTimeout wrapped in a Promise to simulate a
          500ms "network delay" (build this Promise yourself)
        - After the delay, validates that userData has BOTH a
          name and an email (destructure them out first) — if
          either is missing, throw an Error with a clear message
        - If valid, calls store.addUser(userData) and returns
          the created user

   3. Write an async function `runSignupFlow()` that:
        - Creates ONE store using createUserStore()
        - Calls simulateSignup THREE times with different user
          data (make one of them deliberately invalid — missing
          an email — to test your error handling)
        - Uses try/catch around EACH signup attempt so one
          failure doesn't stop the others from running
        - After all three attempts, logs store.getAllUsers() to
          show the final state

   Run runSignupFlow() and verify:
     - Two users were successfully added
     - The invalid one was caught and logged as an error, not
       crashing the whole flow
     - Each user got the correct auto-incremented id
   ================================================================ */

// function createUserStore() {
//   let users = [];
//   let nextId = 1;

//   return {
//     addUser: function (userData) {
//       const newUser = { id: nextId, ...userData };
//       users.push(newUser);
//       nextId++;
//       return newUser;
//     },
//     getUserById: function (id) {
//       return users.find((u) => u.id === id); // find() returns ONE object or
//       // undefined — your original used filter(), which returns an
//       // ARRAY (even if it has just one item). Not a bug exactly,
//       // but find() is the more correct tool for "get exactly one
//       // matching item," matching what the assignment asked for.
//     },
//     getAllUsers: function () {
//       return users;
//     },
//     deleteUser: function (id) {
//       const originalLength = users.length;
//       users = users.filter((u) => u.id !== id);
//       // MISTAKE (your version): you wrote "id--" here, intending to
//       // roll back the auto-increment counter. But "id" here is the
//       // FUNCTION'S PARAMETER (whatever id was passed in to delete),
//       // NOT the closure's "nextId" counter used in addUser — these
//       // are two completely different variables that happen to have
//       // similar names. Decrementing the parameter does nothing
//       // useful at all. The FIX is simpler than trying to repair
//       // it: just don't touch nextId on delete. New users should
//       // keep getting fresh, never-reused ids, even after a
//       // deletion — reusing ids after deletes is what actually
//       // causes bugs (e.g. two different "user #3"s existing at
//       // different points in time).
//       return users.length < originalLength; // true if something was removed
//     },
//   };
// }

// function simulateSignup(store, userData) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       const { name, email } = userData;
//       if (name && email) {
//         resolve(store.addUser(userData));
//       } else {
//         reject(new Error("Invalid user: name and email are both required"));
//       }
//     }, 500);
//   });
// }
// // MISTAKE (your version): simulateSignup() used the OUTER "user"
// // variable directly (store.addUser(userData) was store's own
// // closure, fine) — but note your ORIGINAL code called
// // user.addUser(userData) referencing a store from OUTSIDE the
// // function entirely, meaning simulateSignup could only EVER work
// // with that one hardcoded store. Passing "store" in as a PARAMETER
// // (as done here, and as the assignment asked) makes this function
// // reusable with ANY store, not locked to one global instance.

// async function runSignupFlow() {
//   const store = createUserStore();

//   const signups = [
//     { name: "Rehan", email: "rehan@example.com" },
//     { name: "Alok" }, // deliberately invalid — missing email
//     { name: "Ashish", email: "ashish@example.com" },
//   ];

//   for (const userData of signups) {
//     try {
//       const newUser = await simulateSignup(store, userData);
//       console.log("Signed up:", newUser);
//     } catch (err) {
//       console.log("Signup failed:", err.message);
//       // try/catch INSIDE the loop means one failure doesn't stop
//       // the loop — the next iteration still runs
//     }
//   }

//   console.log("Final users in store:", store.getAllUsers());
// }

// runSignupFlow();
// // MISTAKE (your version): you called simulateSignup() directly and
// // did `console.log(simulate)` immediately — but simulateSignup()
// // RETURNS A PROMISE, so that line just logs "Promise {<pending>}",
// // not the actual result. You also never wrote runSignupFlow() at
// // all, which was the actual point of the assignment (running
// // THREE signups, with error handling around EACH one individually,
// // then showing the final state). Always either .then() a promise,
// // or await it inside an async function, before trying to log its
// // resolved value — logging the promise object itself is one of the
// // most common beginner mistakes with async code.




/* ============================================================
   ASSIGNMENT 6 — Coverage Round

/* ------------------------------------------------------------
   PART A — Hoisting: predict, then verify
   ------------------------------------------------------------
   Targets mistake #1 (assuming hoisting gives the eventual
   value instead of undefined)

   PREDICT the output of each console.log BEFORE running:

   function test() {
     console.log(x);
     console.log(y);
     console.log(getX());

     var x = 1;
     let y = 2;

     function getX() {
       return x + 10;
     }
   }
   test();

   Then answer in a comment: WHY does console.log(y) behave
   differently from console.log(x)? (Hint: this is about the
   Temporal Dead Zone — something NOT covered yet in your files,
   look it up as part of this exercise, it's a small addition to
   hoisting you already know.)
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   PART B — map() vs forEach(): build both, on purpose
   ------------------------------------------------------------
   Targets mistake #2 (map() with no return, used like forEach)

   Given:
     const temps = [30, 25, 40, 15, 35]; // Celsius

   1. Use forEach() to just PRINT each temperature converted to
      Fahrenheit (formula: F = C * 9/5 + 32) — nothing returned,
      pure side effect, no new array expected.

   2. Use map() to build and RETURN a brand new array of the
      Fahrenheit values — store it in a variable and log the
      whole array afterward.

   3. In a comment, explain in your own words: if you swapped
      map() for forEach() in part 2 (keeping everything else
      identical), what would the resulting variable actually
      contain, and why?
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   PART C — async try/catch: make the OUTER catch actually fire
   ------------------------------------------------------------
   Targets mistake #3 (catching inside async swallows the
   rejection from outside .catch() chains)

   Given this helper (you may copy it, it's scaffolding):

     function riskyOperation(shouldFail) {
       return new Promise((resolve, reject) => {
         setTimeout(() => {
           if (shouldFail) reject(new Error("Operation failed"));
           else resolve("Operation succeeded");
         }, 300);
       });
     }

   Write TWO separate async functions:

   1. `swallowsError(shouldFail)` — uses try/catch INSIDE the
      function to catch any rejection, logs the error, and
      returns null on failure. Call it like:
        swallowsError(true).then(r => console.log("got:", r));
        swallowsError(true).catch(e => console.log("caught outside?"));
      Predict: does the SECOND line's .catch() ever actually run?

   2. `letsErrorPropagate(shouldFail)` — does NOT use try/catch at
      all — just awaits riskyOperation() directly and returns its
      result. Call it like:
        letsErrorPropagate(true).then(r => console.log("got:", r));
        letsErrorPropagate(true).catch(e => console.log("caught outside:", e.message));
      Predict: does THIS version's outside .catch() run?

   Write one sentence explaining the actual difference in
   behavior between these two functions.
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   PART D — Naming discipline: refactor for clarity
   ------------------------------------------------------------
   Targets mistake #4 (naming a variable after what you expected
   to extract from it, not what it actually holds)

   Here is DELIBERATELY badly-named code. Rewrite it with better
   variable names (do not change the logic, ONLY the names), then
   in a comment explain what was misleading about each renamed
   variable:

     async function process(id) {
       const name = await fetchUser(id); // holds a whole object, not a name
       const list = await fetchOrders(name.id); // "list" holds an object too, not an array
       return { data: name, extra: list.orders };
     }
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   PART E — Closure variable vs parameter shadowing
   ------------------------------------------------------------
   Targets mistake #5 (assuming a function parameter and a
   closure variable with a similar name are the same variable)

   Write a function `createInventory()` using a closure to hold
   a private `stock` count (start at 0). Return an object with:
     - restock(stock)   -> ADDS the given "stock" amount to the
       private stock count (parameter name DELIBERATELY shadows
       the closure variable — this is the point of the exercise)
     - sell(stock)      -> SUBTRACTS the given "stock" amount from
       the private stock count
     - getStock()       -> returns the current private stock count

   After writing it, answer in a comment: inside restock(), when
   you refer to "stock", which one does JS actually use — the
   PARAMETER or the closure's outer variable? How would you fix
   the function if you needed to refer to BOTH inside the same
   method?
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   PART F — Never log a promise directly
   ------------------------------------------------------------
   Targets mistake #6 (logging a promise object instead of its
   resolved value)

   Given:
     function getRandomNumber() {
       return new Promise((resolve) => {
         setTimeout(() => resolve(Math.floor(Math.random() * 100)), 200);
       });
     }

   Write THREE different ways to correctly log the actual
   resolved number (not the Promise object):
     1. Using .then()
     2. Using await inside an async IIFE: (async () => { ... })();
     3. Using await inside a named async function that you
        explicitly call

   Then, on purpose, write a FOURTH line that DOES log the
   Promise object directly (to see the wrong output for
   yourself), and comment on what it prints.
   ------------------------------------------------------------ */

/*
// undefined
// undefined i do not revise tdz let vs var
// NaN
// */

// const temps = [30, 25, 40, 15, 35]; // Celsius

// temps.forEach((x) => console.log(x * (9 / 5) + 32));
// // foreach transform array not giving brand new array

// const Fahrenheit = temps.map((x) => x * (9 / 5) + 32);
// console.log(Fahrenheit);

// // replacing map with foreach give undefine as foreach only tranform

// function riskyOperation(shouldFail) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (shouldFail) reject(new Error("Operation failed"));
//       else resolve("Operation succeeded");
//     }, 300);
//   });
// }

// async function swallowsError(shouldFail) {
//   try {
//     const result = await riskyOperation(shouldFail);
//     return result;
//   } catch (err) {
//     console.log(err.message);
//     return null;
//   }
// }
// swallowsError(true).then((r) => console.log(r));
// swallowsError(true).catch((e) => console.log("caught"));

// async function letsErrorPropagate(shouldFail) {
//   const result = await riskyOperation(shouldFail);
//   return result;
// }
// letsErrorPropagate(true)
//   .then((r) => console.log(r))
//   .catch((e) => console.log("caught"));
// letsErrorPropagate(true).catch((e) => console.log("caught"));

// async function process(id) {
//   const name = await fetchUser(id); // holds a whole object, not a name
//   const list = await fetchOrders(name.id); // "list" holds an object too, not an array
//   return { data: name, extra: list.orders };
// }

// // name-user
// // name.id-user.id
// // list-orderlist
// // extra-order
// // orderlist.orders

// function createInventory() {
//   let stock = 0;
//   return {
//     restock: function (stock) {
//       stock += stock;
//       return stock;
//     },
//     sell: function (stock) {
//       stock -= stock;
//     },
//     getstock: function () {
//       return stock;
//     },
//   };
// }

// const inv = createInventory();
// console.log(inv.getstock());
// console.log(inv.restock(500));
// console.log(inv.getstock());

// console.log(inv.restock(500));

// console.log(inv.getstock());

// function getRandomNumber() {
//   return new Promise((resolve) => {
//     setTimeout(() => resolve(Math.floor(Math.random() * 100)), 200);
//   });
// }

// getRandomNumber().then((r) => console.log(r));

// (async () => {
//   const result1 = await getRandomNumber();
//   console.log(result1);
// })();

// async function call() {
//   const result2 = await getRandomNumber();
//   return result2;
// }
// call().then((r) => console.log(r));

// console.log(call());


/* ============================================================
   ASSIGNMENT 7
   ============================================================ */


/*
   THE SCENARIO:
   You're building a tiny in-memory "order processing system" for
   a shop. Orders come in, get validated, get priced, get logged,
   and get summarized.
*/


/* ------------------------------------------------------------
   PART 1 — Hoisting + Execution Context, predicted cold
   ------------------------------------------------------------
   PREDICT every line's output BEFORE running:

     console.log(shopName);
     console.log(getGreeting());

     var shopName = "Rehan's Store";

     function getGreeting() {
       return "Welcome to " + shopName;
     }

   Write your prediction as a comment, then run it and compare.
   If your two predictions don't match what you'd expect from
   "memory phase runs before code phase," write one sentence
   explaining the mismatch.
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   PART 2 — The order data (copy this, it's scaffolding)
   ------------------------------------------------------------ */

const rawOrders = [
  { orderId: 1, customer: "Alok", items: [{ name: "Pen", price: 20, qty: 5 }, { name: "Notebook", price: 60, qty: 2 }] },
  { orderId: 2, customer: "Ashish", items: [{ name: "Bag", price: 800, qty: 1 }] },
  { orderId: 3, customer: "Ankit", items: [] }, // deliberately empty — no items
  { orderId: 4, customer: "Pranav", items: [{ name: "Bottle", price: 150, qty: 3 }, { name: "Pen", price: 20, qty: 10 }] },
];


/* ------------------------------------------------------------
   PART 3 — Pricing with map/reduce, plus your OWN custom HOF
   ------------------------------------------------------------
   Write a function `calculateOrderTotal(order)` that takes ONE
   order object and returns the total price for that order.

     - Use map() to TRANSFORM the items array into an array of
       line totals (price * qty for each item)
     - Use reduce() to SUM those line totals into one number
     - Order 3 has an EMPTY items array — the function must
       return 0, not undefined or NaN — think about reduce()'s
       initial value argument here

   Then write your OWN custom higher-order function (don't reuse
   map/reduce for this one — build a fresh HOF like your earlier
   calculate(radius, logic) pattern) called
   `applyToEachOrder(orders, logic)` that loops through rawOrders
   applying "logic" to each, collecting results:

     const allTotals = applyToEachOrder(rawOrders, calculateOrderTotal);

   PREDICT the allTotals array before running.
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   PART 4 — A closure-based logger, using callbacks
   ------------------------------------------------------------
   Write a function `createOrderLogger()` that uses a closure to
   hold a private array called `log` (starts empty). Return an
   object with:
     - record(entry)   -> pushes "entry" into the private log
     - getLog()        -> returns the full log array
     - printLog(formatterCallback) -> loops through the log and
       calls formatterCallback(entry) for EACH entry, printing
       whatever it returns (this is a CALLBACK being used
       intentionally here, separate from the HOF you already
       built in Part 3 — notice how similar the shape is)

   Test it: record two or three plain string messages, then call
   printLog with a callback that wraps each message like
   "[LOG] <message>".
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   PART 5 — Async validation, deliberate naming + error-flow trap
   ------------------------------------------------------------
   Write an async function `validateOrder(order)` that:
     - Wraps a setTimeout in a Promise (simulate a 300ms "check")
     - REJECTS if order.items.length === 0
     - Otherwise RESOLVES with the order unchanged

   Naming rule (forces discipline on purpose): whatever variable
   holds validateOrder's resolved value must be named
   `validatedOrder` — not `order`, not `result`, not `data`.

   Now write an async function `processOrder(order, logger)` that:
     - Calls validateOrder(order) and AWAITS it
     - Do NOT wrap this call in try/catch inside processOrder —
       let a rejection PROPAGATE OUT. Decide this deliberately,
       don't default to catching everything everywhere.
     - On success: call calculateOrderTotal() on the
       validatedOrder, call logger.record() with a message noting
       the customer and total (use destructuring to pull
       "customer" out of validatedOrder), and return
       { customer, total }
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   PART 6 — Run all orders in PARALLEL, using the right Promise API
   ------------------------------------------------------------
   Write an async function `processAllOrders(orders, logger)`
   that calls processOrder() on EVERY order IN PARALLEL — not
   sequentially — and captures BOTH successes AND failures
   without one failure hiding the other three results.

   You already know the ONE Promise API built exactly for this
   (wait for everything, never short-circuit, get a status +
   value/reason for each). Use it deliberately.

   Build a final results array shaped like:
     - success: { customer, total }
     - failure: { customer, error: "message" }
   (You'll need order.customer directly from rawOrders for the
   failure case, since a rejected validateOrder never gives you
   a validatedOrder to destructure from.)

   PREDICT the shape of the final array, and specifically which
   ONE entry looks different from the other three, before running.
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   PART 7 — A closure counter WITH a shadowing trap (build it
   yourself this time — no naming loophole allowed)
   ------------------------------------------------------------
   Write `createOrderCounter()` using a closure to hold a private
   `count` starting at 0. Return an object with:
     - recordOrder(count)  -> parameter DELIBERATELY named
       "count", same as the closure variable
     - getCount()          -> returns the current private count

   Inside recordOrder, increment the REAL closure count by 1 each
   call — WITHOUT renaming the parameter. There is a way to reach
   the outer closure variable even with a same-named parameter
   blocking direct access — think about what other syntax lets
   you refer to "the object this closure belongs to" rather than
   the bare variable name.

   Test it: call recordOrder(1) four times (once per order,
   success or fail), then getCount() — predict the output first.
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   PART 8 — `this`, call/apply/bind, tying into your logger
   ------------------------------------------------------------
   Write an object `reportPrinter` with:
     - prefix: "[SHOP REPORT] "
     - print: function(message) { console.log(this.prefix + message); }

   Then:
     1. Call reportPrinter.print("test") normally — confirm "this"
        resolves to reportPrinter.
     2. DETACH the method: const detachedPrint = reportPrinter.print;
        call detachedPrint("test") plainly — predict what happens
        to "this" here, and why it's different from step 1.
     3. Use .call() or .bind() to fix step 2 so it correctly logs
        with the right prefix, without modifying reportPrinter or
        detachedPrint's original definition.
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   PART 9 — Tie EVERYTHING together, prove nothing logs a
   pending promise anywhere
   ------------------------------------------------------------
   Using an async IIFE:
     1. Create ONE logger (createOrderLogger) and ONE counter
        (createOrderCounter)
     2. Call processAllOrders(rawOrders, logger) and AWAIT it —
        log the resolved results array (not a pending Promise)
     3. Call counter.recordOrder(1) once per order in rawOrders
        (all 4, regardless of success/failure), then log
        counter.getCount()
     4. Call logger.printLog() with a formatter callback, using
        reportPrinter.print (properly bound via Part 8's fix) as
        part of how each log line gets printed

   Final output should clearly show:
     - The array of 4 results (3 successful, 1 with an error)
     - A count of 4
     - The logger's recorded entries, each printed with the
       "[SHOP REPORT] " prefix intact
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   SELF-CHECK BEFORE YOU CONSIDER THIS DONE
   ------------------------------------------------------------
   - Part 1: did your prediction match actual hoisting behavior,
     or did you assume the assigned VALUE was available early?
   - Part 3: does calculateOrderTotal handle the EMPTY order
     (order 3) without crashing or returning NaN/undefined?
   - Part 5: did you deliberately choose NOT to try/catch inside
     processOrder, and can you explain why that choice matters
     for Part 6 to work correctly?
   - Part 6: did you pick the Promise API that captures BOTH
     outcomes without one failure hiding the other three?
   - Part 7: does getCount() reflect real increments, or does
     shadowing silently swallow them?
   - Part 8: did detachedPrint("test") actually break in step 2,
     and did your call()/bind() fix in step 3 actually work?
   - Part 9: did you ever write console.log(someAsyncCall())
     anywhere without await/.then() around it?

   If any answer is "no" or "not sure," that's the ONE topic
   worth re-reading — not the whole file.
   ------------------------------------------------------------ */


   /*
// underfined
// welcome to undefined
// */

// const rawOrders = [
//   {
//     orderId: 1,
//     customer: "Alok",
//     items: [
//       { name: "Pen", price: 20, qty: 5 },
//       { name: "Notebook", price: 60, qty: 2 },
//     ],
//   },
//   {
//     orderId: 2,
//     customer: "Ashish",
//     items: [{ name: "Bag", price: 800, qty: 1 }],
//   },
//   { orderId: 3, customer: "Ankit", items: [] }, // deliberately empty — no items
//   {
//     orderId: 4,
//     customer: "Pranav",
//     items: [
//       { name: "Bottle", price: 150, qty: 3 },
//       { name: "Pen", price: 20, qty: 10 },
//     ],
//   },
// ];

// function calculateOrderTotal(order) {
//   const itemarray = order.items;
//   // console.log(itemarray)
//   const price = itemarray.map((x) => x.price * x.qty);
//   // console.log(price)
//   const totalprice = price.reduce((acc, curr) => {
//     return acc + curr;
//   }, 0);
//   // console.log(totalprice)
//   return totalprice;
// }
// console.log(calculateOrderTotal(rawOrders[2]));

// // logic based

// function applyToEachOrder2(orders, logic) {
//   let ans = [];
//   for (let i = 0; i < orders.length; i++) {
//     ans.push(logic(orders[i]));
//   }
//   return ans;
// }
// console.log(applyToEachOrder2(rawOrders, calculateOrderTotal));

// function createOrderLogger() {
//   let log = [];
//   return {
//     record: function (entry) {
//       log.push(entry);
//     },
//     getlog: function () {
//       return log;
//     },
//     printlog: function (formatterCallback) {
//       for (let i = 0; i < log.length; i++) {
//         console.log(formatterCallback(log[i]));
//       }
//     },
//   };
// }

// function formatterCallback(entry) {
//   return `[LOG] ${entry}`;
// }

// const myLogger = createOrderLogger();

// myLogger.record("Order 101 placed by Alok");
// myLogger.record("Payment received for Order 102");
// myLogger.record("Order 103 items are out of stock");

// myLogger.printlog(formatterCallback);
// console.log(myLogger.getlog());

// async function validateOrder(order) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (order.items.length === 0) {
//         reject(new Error(`Invalid Order for ${order.customer}`));
//       } else {
//         resolve(order);
//       }
//     }, 500);
//   });
// }

// async function processOrder(order, logger) {
//   let validatedOrder = await validateOrder(order);
//   const total = calculateOrderTotal(validatedOrder);
//   const { customer } = validatedOrder;
//   logger.record(`Processed Order For ${customer}. Total: ₹$${total}`);
//   return { customer, total };
// }
// processOrder(rawOrders[0], myLogger).then((r) => console.log(r));

// async function processAllOrders(orders, logger) {
//   const promises = orders.map((order) => processOrder(order, logger));
//   const settle = await Promise.allSettled(promises);
//   return settle.map((x) => x.value || x.reason);
// }
// processAllOrders(rawOrders, myLogger).then((r) => console.log(r));

// function createOrderCounter() {
//   const counterobj = {
//     count: 0,
//     recordOrder: function (count) {
//       this.count++; 
//     },
//     getCount: function () {
//       return this.count;
//     },
//   };
//   return counterobj;
// }

// const create = createOrderCounter();
// create.recordOrder(1);
// create.recordOrder(5);
// create.recordOrder(1);
// create.recordOrder(4);

// console.log(create.getCount()); 



