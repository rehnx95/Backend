/* ============================================================
   ASYNC / AWAIT — Syntactic Sugar Over Promises
   ============================================================
   Direct payoff of your two Promises files — everything here
   is the SAME underlying mechanism (Promises, .then, microtask
   queue), just written in a way that LOOKS synchronous.
   ============================================================ */


/* ------------------------------------------------------------
   PART 1: async FUNCTIONS ALWAYS RETURN A PROMISE
   ------------------------------------------------------------ */

async function getData() {
  return "Namaste"; // a plain string, NOT a promise
}

const dataPromise = getData();
console.log(dataPromise); // Promise {<fulfilled>: 'Namaste'}
// Even though we returned a plain string, the "async" keyword
// AUTOMATICALLY wraps it in a resolved promise. You NEVER get
// a raw value back from an async function — always a promise.

dataPromise.then(function (result) {
  console.log("Resolved value:", result); // "Namaste"
});

// If you explicitly return a promise, async does NOT double-wrap it —
// it just uses that promise directly as the function's return value
async function getDataExplicitPromise() {
  return Promise.resolve("Namaste (explicit promise)");
}
getDataExplicitPromise().then(function (result) {
  console.log(result); // "Namaste (explicit promise)"
});


/* ------------------------------------------------------------
   PART 2: await CAN ONLY BE USED INSIDE AN async FUNCTION
   ------------------------------------------------------------ */

function createOrder(cart) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("orderId123");
    }, 1000);
  });
}

// await outputCart(); // SyntaxError: await is only valid in async functions
// You CANNOT use await at the top level of a regular function or
// script (outside modules) — it must be inside a function marked "async".

async function handleOrder() {
  const orderId = await createOrder(["shoes", "pants"]);
  // "await" PAUSES execution of THIS function right here, until
  // the promise from createOrder() settles — then "orderId" gets
  // the RESOLVED VALUE directly, not a Promise object
  console.log("Order created:", orderId); // "orderId123", after ~1 sec
}

handleOrder();


/* ------------------------------------------------------------
   PART 3: await MAKES ASYNC CODE LOOK SYNCHRONOUS
   ------------------------------------------------------------
   Compare this to Part 7 of your first Promises file (the
   .then() chain version) — SAME four steps, SAME async behavior,
   but written top-to-bottom like normal synchronous code.
   ------------------------------------------------------------ */

function proceedToPayment(orderId) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("paymentInfo for " + orderId);
    }, 1000);
  });
}
function showOrderSummary(paymentInfo) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("orderSummary using " + paymentInfo);
    }, 1000);
  });
}
function updateWalletBalance(orderSummary) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("walletUpdated after " + orderSummary);
    }, 1000);
  });
}

async function handleFullOrder() {
  const orderId = await createOrder(["shoes", "pants"]);
  const paymentInfo = await proceedToPayment(orderId);
  const orderSummary = await showOrderSummary(paymentInfo);
  const walletUpdated = await updateWalletBalance(orderSummary);
  console.log("Final result:", walletUpdated);
}

handleFullOrder();

/*
   COMPARE THIS TO THE .then() CHAIN VERSION FROM YOUR PROMISES
   FILE:
     createOrder(cart)
       .then(orderId => proceedToPayment(orderId))
       .then(paymentInfo => showOrderSummary(paymentInfo))
       .then(orderSummary => updateWalletBalance(orderSummary))
       .then(walletUpdated => console.log(walletUpdated));

   SAME exact async behavior underneath. async/await is just a
   DIFFERENT, more readable SYNTAX for the exact same promise
   chaining mechanism — no new capability, just easier to read
   and reason about (no more remembering to `return` inside
   every .then(), for instance — await handles that automatically).
*/


/* ------------------------------------------------------------
   PART 4: BEHIND THE SCENES — DOES await BLOCK THE CALL STACK?
   ------------------------------------------------------------
   NO. This is the most commonly misunderstood part. await does
   NOT freeze the entire program (unlike, say, a busy-loop). It
   only SUSPENDS the current async function, and control goes
   back to the Call Stack to keep running OTHER code in the
   meantime.
   ------------------------------------------------------------ */

async function slowFunction() {
  console.log("2: slowFunction started");
  const result = await createOrder(["item"]); // suspends HERE for ~1 sec
  console.log("4: slowFunction resumed with:", result);
}

console.log("1: Before calling slowFunction");
slowFunction();
console.log("3: This runs immediately, WHILE slowFunction is suspended");

/*
   Output order:
     1: Before calling slowFunction
     2: slowFunction started
     3: This runs immediately, WHILE slowFunction is suspended
     4: slowFunction resumed with: orderId123    <-- after ~1 sec

   WALKTHROUGH:
   1. "1: Before calling..." logs normally
   2. slowFunction() is called -> its Execution Context is pushed
      -> "2: slowFunction started" logs
   3. execution hits `await createOrder(...)`
        -> createOrder() is CALLED immediately, its own setTimeout
           starts counting down in the Web API environment
        -> the async function slowFunction() is SUSPENDED right
           here — its Execution Context is essentially "paused"
           and REMOVED from the Call Stack (not blocking it)
        -> control returns to WHOEVER called slowFunction()
   4. execution continues in the OUTER code -> "3: This runs
      immediately..." logs, proving the Call Stack was NOT frozen
   5. once createOrder()'s promise resolves (~1 sec later), the
      REST of slowFunction() (everything after the await line)
      is scheduled to resume, ultimately via the microtask queue
      from your Event Loop file
   6. "4: slowFunction resumed..." finally logs

   KEY TAKEAWAY: "await" pauses only ITS OWN function's
   progress — it does NOT pause the entire program. This is
   exactly consistent with everything from your Event Loop file:
   the Call Stack keeps moving, and suspended async functions
   get resumed later via the same queue mechanism.
*/


/* ------------------------------------------------------------
   PART 5: REAL-WORLD EXAMPLE — fetch() WITH ASYNC/AWAIT
   ------------------------------------------------------------
   NOTE: fetch() is a Web API (browser) / also available in
   modern Node.js. This block needs actual network access to
   run — shown here exactly as the video demonstrates it.
   ------------------------------------------------------------ */

async function handlePromise() {
  const data = await fetch("https://api.github.com/users/akshaymarch7");
  // "data" here is a RESPONSE object, NOT the actual JSON yet —
  // fetch()'s promise resolves once HEADERS arrive, not once the
  // full body has been read

  const jsonValue = await data.json();
  // .json() ALSO returns a promise (parsing the response body
  // stream takes time too) — so it needs its OWN await
  console.log(jsonValue);
}

// handlePromise();

/*
   WHY TWO SEPARATE "await"s ARE NEEDED HERE:
   - fetch(url) returns a promise that resolves as soon as the
     response STARTS arriving (headers received) — not once the
     whole body is downloaded
   - data.json() is ITSELF an async operation (reading + parsing
     the response body as JSON) and returns its OWN promise
   - forgetting the second await would give you a raw, unresolved
     Promise object instead of the actual parsed data — a common
     beginner mistake
*/


/* ------------------------------------------------------------
   PART 6: ERROR HANDLING — try...catch (NOT .catch())
   ------------------------------------------------------------
   Since async/await makes code LOOK synchronous, error handling
   also switches to the SYNCHRONOUS style: try...catch, instead
   of chaining .catch() onto a promise.
   ------------------------------------------------------------ */

async function handlePromiseWithErrorHandling() {
  try {
    const data = await fetch("https://api.github.com/users/akshaymarch7");
    const jsonValue = await data.json();
    console.log(jsonValue);
  } catch (err) {
    // catches errors from EITHER await line above — a network
    // failure, an invalid URL, a parsing failure, ANYTHING that
    // rejects within the try block
    console.log("Something went wrong:", err.message);
  }
}

// handlePromiseWithErrorHandling();

/*
   WHY try...catch INSTEAD OF .catch()?
   Because "await" essentially "unwraps" a promise into either:
     - its resolved VALUE (success case — code just continues)
     - a THROWN ERROR (failure case — exactly like a normal
       synchronous throw)

   Since a REJECTED awaited promise behaves like code throwing an
   error, the NATURAL way to catch it is the same tool you'd use
   for synchronous errors: try...catch. This is a direct
   consequence of async/await being "syntactic sugar" — it makes
   async errors behave like sync errors too, not just async
   SUCCESS look synchronous.
*/


/* ------------------------------------------------------------
   PART 7: async/await IS SYNTACTIC SUGAR — PROVING IT
   ------------------------------------------------------------
   These two functions do THE EXACT SAME THING. One uses
   .then()/.catch(), the other uses async/await. Same result,
   same timing, same error behavior — just different syntax.
   ------------------------------------------------------------ */

// Version A: Promise chaining
function getOrderWithThen() {
  return createOrder(["item"])
    .then(function (orderId) {
      return proceedToPayment(orderId);
    })
    .then(function (paymentInfo) {
      console.log("(.then version) Payment info:", paymentInfo);
      return paymentInfo;
    })
    .catch(function (error) {
      console.log("(.then version) Error:", error.message);
    });
}

// Version B: async/await — IDENTICAL behavior, different syntax
async function getOrderWithAwait() {
  try {
    const orderId = await createOrder(["item"]);
    const paymentInfo = await proceedToPayment(orderId);
    console.log("(async/await version) Payment info:", paymentInfo);
    return paymentInfo;
  } catch (error) {
    console.log("(async/await version) Error:", error.message);
  }
}

getOrderWithThen();
getOrderWithAwait();
// Both log nearly identical output, at nearly identical times —
// proof that async/await doesn't do anything NEW under the hood,
// it's just a cleaner way to WRITE the same promise-based logic.


/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. An async function ALWAYS returns a promise — a returned
      non-promise value gets auto-wrapped in a resolved promise
   2. await can ONLY be used inside an async function
   3. await PAUSES that function's own execution until the
      awaited promise settles, then gives you the resolved VALUE
      directly (not a Promise object)
   4. await does NOT block the Call Stack / main thread — only
      the specific async function is suspended; everything else
      keeps running normally in the meantime
   5. fetch() + .json() both return promises — BOTH typically
      need their own await
   6. Error handling switches from .catch() to try...catch,
      since a rejected awaited promise behaves like a thrown error
   7. async/await is SYNTACTIC SUGAR over standard promise
      chaining — same mechanism, same timing, just more readable
      code with no new capability
   ------------------------------------------------------------ */