
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
