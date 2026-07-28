/* ------------------------------------------------------------
   PART 1: CREATING A PROMISE FROM SCRATCH — THE EXECUTOR FUNCTION
   ------------------------------------------------------------
   new Promise(executorFunction) — the executor function is
   called IMMEDIATELY (synchronously) by the JS engine, and it
   receives TWO functions as arguments, ALREADY PROVIDED for you
   by the engine: resolve and reject. You don't create resolve
   and reject yourself — the Promise constructor hands them to you.
   ------------------------------------------------------------ */

const myFirstPromise = new Promise(function (resolve, reject) {
  // this executor function runs RIGHT AWAY, synchronously
  console.log("Executor function running immediately");

  const success = true; // pretend this represents some async check

  if (success) {
    resolve("Operation succeeded!"); // moves promise to FULFILLED state
  } else {
    reject("Operation failed!"); // moves promise to REJECTED state
  }
});

myFirstPromise.then(function (result) {
  console.log("Result:", result); // "Operation succeeded!"
});

/*
   IMPORTANT: the EXECUTOR function itself runs SYNCHRONOUSLY,
   immediately when `new Promise(...)` is called — you'll see
   "Executor function running immediately" print BEFORE anything
   else, even before .then() gets a chance to run its callback
   (which always happens asynchronously, via the microtask queue
   from your Event Loop file, no matter how fast resolve() fires).
*/


/* ------------------------------------------------------------
   PART 2: A REALISTIC ASYNC PROMISE (using setTimeout)
   ------------------------------------------------------------ */

function createOrder(cart) {
  return new Promise(function (resolve, reject) {
    // executor runs immediately, but resolve/reject are called
    // LATER, once the "async work" (setTimeout here) finishes
    setTimeout(function () {
      if (cart.length === 0) {
        reject(new Error("Cart is empty")); // best practice: reject with an Error object
        return; // stop here, don't continue to resolve()
      }
      const orderId = "12345";
      resolve(orderId);
    }, 1000);
  });
}

const cart = ["shoes", "pants", "kurta"];
createOrder(cart).then(function (orderId) {
  console.log("Order created:", orderId);
});

/*
   NOTE: rejecting with `new Error("message")` instead of a plain
   string is generally BEST PRACTICE — Error objects carry a
   stack trace, which is far more useful for debugging than a
   bare string when something actually goes wrong in production.
*/


/* ------------------------------------------------------------
   PART 3: ERROR HANDLING — WHY .catch() MATTERS
   ------------------------------------------------------------ */

// WITHOUT .catch() — an unhandled rejection:
createOrder([]) // empty cart -> will reject
  .then(function (orderId) {
    console.log("This will never run");
  });
// In Node, this logs an "UnhandledPromiseRejection" warning.
// In a browser, you'll see "Uncaught (in promise) Error: Cart is empty"
// in the console. Either way — an unhandled rejection is a real
// problem: it means an error happened and NOTHING in your code
// was told about it or given a chance to respond.

// WITH .catch() — properly handled:
createOrder([])
  .then(function (orderId) {
    console.log("This will never run either, cart is empty");
  })
  .catch(function (error) {
    console.log("Caught the error gracefully:", error.message); // "Cart is empty"
  });
// No warning this time — the rejection was HANDLED, not ignored.


/* ------------------------------------------------------------
   PART 4: THE CRUCIAL RETURN RULE (recap + reinforcement)
   ------------------------------------------------------------
   Already covered in your last Promises file, but worth
   reinforcing since it's THE most common real bug: if a .then()
   callback doesn't `return` its promise (or value), the next
   .then() receives `undefined` instead of the real data.
   ------------------------------------------------------------ */

function proceedToPayment(orderId) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("Payment successful for order " + orderId);
    }, 1000);
  });
}

createOrder(cart)
  .then(function (orderId) {
    return proceedToPayment(orderId); // returning the NEXT promise
  })
  .then(function (paymentResult) {
    console.log("Chained correctly:", paymentResult);
  })
  .catch(function (error) {
    console.log("Error in chain:", error.message);
  });


/* ------------------------------------------------------------
   PART 5: MULTIPLE .catch() BLOCKS AT DIFFERENT STAGES
   ------------------------------------------------------------
   You can place MORE THAN ONE .catch() in a single chain. Each
   .catch() only handles errors that happened ABOVE it (i.e.,
   in any .then() BEFORE that .catch() in the chain) — NOT
   errors that happen further down, AFTER that .catch().
   ------------------------------------------------------------ */

function showOrderSummary(paymentResult) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      // simulate a failure at THIS specific stage
      reject(new Error("Failed to load order summary"));
    }, 1000);
  });
}

function updateWalletBalance(orderSummary) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve("Wallet updated");
    }, 1000);
  });
}

createOrder(cart)
  .then(function (orderId) {
    return proceedToPayment(orderId);
  })
  .catch(function (error) {
    // this ONLY catches errors from createOrder() or the FIRST .then()
    // above it — errors from steps written BELOW this .catch() will
    // NOT be caught here, they'll skip past this and look for the
    // NEXT .catch() further down the chain instead
    console.log("Early stage error:", error.message);
  })
  .then(function (paymentResult) {
    return showOrderSummary(paymentResult);
  })
  .then(function (orderSummary) {
    return updateWalletBalance(orderSummary);
  })
  .then(function (walletResult) {
    console.log("Final result:", walletResult);
  })
  .catch(function (error) {
    // this catches errors from showOrderSummary() or
    // updateWalletBalance() — the LATER stages, since this
    // .catch() sits BELOW them in the chain
    console.log("Late stage error:", error.message);
  });

/*
   In THIS example, showOrderSummary() rejects. Since the ONLY
   .catch() that sits BELOW showOrderSummary() in the chain is
   the LAST one, that's the one that catches it:

     Late stage error: Failed to load order summary

   The FIRST .catch() (positioned between proceedToPayment and
   showOrderSummary) does NOT run at all here, because no error
   occurred in createOrder() or proceedToPayment() — those both
   succeeded fine.

   RULE OF THUMB: a .catch() acts like a "checkpoint" that only
   looks BACKWARD (upward) in the chain for unhandled errors —
   never forward.
*/


/* ------------------------------------------------------------
   PART 6: CODE AFTER A .catch() STILL RUNS — EVEN AFTER A FAILURE
   ------------------------------------------------------------
   A KEY, sometimes surprising rule: once a .catch() HANDLES an
   error, the CHAIN CONTINUES normally from that point onward —
   any .then() written AFTER that .catch() WILL still execute,
   treating the .catch()'s return value as a normal SUCCESS.
   ------------------------------------------------------------ */

createOrder([]) // will reject immediately (empty cart)
  .then(function (orderId) {
    console.log("This will NOT run (cart is empty, rejected)");
    return orderId;
  })
  .catch(function (error) {
    console.log("Caught:", error.message); // "Cart is empty"
    return "fallback-order-id"; // recovering from the error with a fallback value
  })
  .then(function (result) {
    // THIS STILL RUNS! Even though the promise chain FAILED
    // earlier, catching the error effectively "resets" the
    // chain back to a successful state from this point on.
    console.log("Continues after catch, received:", result);
    // "Continues after catch, received: fallback-order-id"
  });

/*
   WHY THIS MATTERS: .catch() isn't just a dead-end for errors —
   it's an OPPORTUNITY to RECOVER and let the rest of the chain
   continue with a fallback value, exactly like a try/catch block
   in synchronous code letting execution continue after the catch.

   If you DON'T want the chain to continue after an error, you'd
   need to `throw` again inside the .catch() (re-throwing the
   error), which would then propagate down to LOOK FOR THE NEXT
   .catch() further down the chain, if one exists.
*/


/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. new Promise(executor) — the executor function runs
      IMMEDIATELY and SYNCHRONOUSLY; it receives resolve and
      reject, both PROVIDED by the JS engine
   2. resolve(value) -> promise becomes FULFILLED
      reject(reason) -> promise becomes REJECTED (best practice:
      reject with an Error object, not a plain string)
   3. .catch() handles rejections gracefully — without it, you
      get an unhandled rejection warning/error
   4. ALWAYS return the next promise (or value) from inside a
      .then() handler, or the chain breaks and the next .then()
      receives undefined
   5. Multiple .catch() blocks can exist in one chain — each one
      only catches errors from stages ABOVE it, never below
   6. Once a .catch() handles an error, the chain CONTINUES —
      any .then() written after it still runs normally, treating
      the .catch()'s return value as a fresh success
   ------------------------------------------------------------ */