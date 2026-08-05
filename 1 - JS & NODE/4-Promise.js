/* ============================================================
   PROMISES — Solving Callback Hell & Inversion of Control
   ============================================================ */


/* ------------------------------------------------------------
   PART 1: A SIMULATED ASYNC API (used throughout this file)
   ------------------------------------------------------------
   Standing in for a real network call / database call, since
   we can't actually hit a server here. This mimics an API that
   sometimes succeeds and sometimes fails.
   ------------------------------------------------------------ */

const cart = ["shoes", "pants", "kurta"];

function createOrderCallback(cart, successCallback, failureCallback) {
  setTimeout(function () {
    if (cart.length > 0) {
      const orderId = "12345";
      successCallback(orderId);
    } else {
      failureCallback("Cart is empty");
    }
  }, 1000);
}


/* ------------------------------------------------------------
   PART 2: THE PROBLEM — INVERSION OF CONTROL
   ------------------------------------------------------------
   When you pass YOUR callback into someone else's function,
   you're handing over CONTROL of your own code. You have to
   BLINDLY TRUST that:
     - it will actually call your callback
     - it will call it only ONCE (not zero times, not five times)
     - it will call it at a reasonable time
     - it won't throw an error and skip your callback entirely

   You have NO guarantee of any of this — the function might be
   from a third-party library with bugs, or might change behavior
   in a future update, and your code would silently break.
   ------------------------------------------------------------ */

createOrderCallback(
  cart,
  function (orderId) {
    console.log("Order placed successfully! Order ID:", orderId);
  },
  function (error) {
    console.log("Order failed:", error);
  }
);

/*
   You wrote createOrderCallback() and handed it your two
   callbacks. From this point on, YOU no longer control when (or
   if) your own code runs — createOrderCallback() does. This is
   INVERSION OF CONTROL: control has been inverted, handed away
   from your code to someone else's.
*/


/* ------------------------------------------------------------
   PART 3: THE PROBLEM — CALLBACK HELL (PYRAMID OF DOOM)
   ------------------------------------------------------------
   When multiple async operations depend on EACH OTHER (step 2
   needs the result of step 1, step 3 needs the result of step 2,
   etc.), callbacks force you to nest them deeper and deeper.
   ------------------------------------------------------------ */

function createOrder(cart, callback) {
  setTimeout(function () {
    callback("orderId123");
  }, 1000);
}
function proceedToPayment(orderId, callback) {
  setTimeout(function () {
    callback("paymentInfo");
  }, 1000);
}
function showOrderSummary(paymentInfo, callback) {
  setTimeout(function () {
    callback("orderSummary");
  }, 1000);
}
function updateWalletBalance(orderSummary, callback) {
  setTimeout(function () {
    callback("walletUpdated");
  }, 1000);
}

// THE PYRAMID OF DOOM:
createOrder(cart, function (orderId) {
  proceedToPayment(orderId, function (paymentInfo) {
    showOrderSummary(paymentInfo, function (orderSummary) {
      updateWalletBalance(orderSummary, function (walletUpdated) {
        console.log("All done:", walletUpdated);
        // imagine 3 more steps needed here... it just keeps
        // growing sideways, further and further to the right
      });
    });
  });
});

/*
   PROBLEMS WITH THIS SHAPE OF CODE:
   - it grows HORIZONTALLY (sideways), forming a "pyramid" shape
     as each step nests inside the last
   - hard to READ — you have to track deeply nested closing braces
   - hard to MAINTAIN — inserting a new step in the middle means
     re-indenting everything below it
   - hard to handle ERRORS properly — you'd need a failure
     callback at EVERY level, multiplying the mess even further
   - this combines with Inversion of Control FOUR TIMES OVER —
     you're trusting FOUR different functions to behave correctly
*/


/* ------------------------------------------------------------
   PART 4: THE SOLUTION — WHAT IS A PROMISE?
   ------------------------------------------------------------
   A Promise is an OBJECT that represents the EVENTUAL completion
   (or failure) of an asynchronous operation. Instead of handing
   your callback INTO a function and trusting it, the function
   hands YOU BACK a promise object — and you ATTACH your callback
   to it using .then(). Control stays with YOUR code.
   ------------------------------------------------------------ */

function createOrderPromise(cart) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (cart.length > 0) {
        const orderId = "12345";
        resolve(orderId); // operation succeeded -> fulfill the promise
      } else {
        reject("Cart is empty"); // operation failed -> reject the promise
      }
    }, 1000);
  });
}

const orderPromise = createOrderPromise(cart);
console.log("orderPromise right after creation:", orderPromise);
// At this exact instant: Promise { <pending> }
// The async work hasn't finished yet — the promise object exists
// immediately, but its result doesn't, yet.

orderPromise.then(function (orderId) {
  console.log("Promise resolved! Order ID:", orderId);
});

/*
   KEY DIFFERENCE FROM CALLBACKS:
   - createOrderPromise() RETURNS something immediately (a Promise
     object) — you get something concrete back right away
   - YOU decide what to do with it, by calling .then() on IT
   - you're not handing your logic INTO someone else's function
     and hoping — you're ATTACHING to an object THEY handed back
     to YOU
   - this restores control to your own code
*/


/* ------------------------------------------------------------
   PART 5: PROMISE ANATOMY — PromiseState & PromiseResult
   ------------------------------------------------------------
   Every Promise object internally tracks TWO things:
     - PromiseState: "pending" | "fulfilled" | "rejected"
     - PromiseResult: undefined until settled, then holds the
       resolved value (on success) or rejection reason (on failure)

   Try this yourself in a browser/Node console:
     const p = createOrderPromise(cart);
     console.log(p);          // Promise {<pending>}
     // wait about 1 second...
     console.log(p);          // Promise {<fulfilled>: '12345'}
   ------------------------------------------------------------ */

const demoPromise = createOrderPromise(cart);
console.log("Immediately:", demoPromise); // pending

setTimeout(function () {
  console.log("After ~1.5 sec (promise has settled by now):", demoPromise);
  // Promise {<fulfilled>: '12345'}
}, 1500);


/* ------------------------------------------------------------
   PART 6: THE THREE STATES — PENDING, FULFILLED, REJECTED
   ------------------------------------------------------------ */

// FULFILLED example
createOrderPromise(["item1"]).then(function (orderId) {
  console.log("Fulfilled example, orderId:", orderId);
});

// REJECTED example — needs a SECOND argument to .then(), or use .catch()
createOrderPromise([]) // empty cart -> will reject
  .then(function (orderId) {
    console.log("This will NOT run since the promise rejects");
  })
  .catch(function (error) {
    console.log("Rejected example, error:", error); // "Cart is empty"
  });

/*
   IMMUTABILITY: once a promise SETTLES (becomes fulfilled or
   rejected), its state and result CANNOT be changed again. Even
   if the underlying async code somehow tried to call resolve()
   AGAIN after already resolving, JS ignores the second call.
   This guarantees a promise's outcome is reliable and final —
   you'll never see a promise "flip" from fulfilled to rejected
   or vice versa after settling.
*/


/* ------------------------------------------------------------
   PART 7: PROMISE CHAINING — FIXING THE PYRAMID OF DOOM
   ------------------------------------------------------------
   Now let's rewrite Part 3's callback pyramid using Promises.
   Each async function returns a NEW Promise, and .then() chains
   flow DOWNWARD (vertically) instead of nesting sideways.
   ------------------------------------------------------------ */


createOrderP(cart)
  .then(function (orderId) {
    return proceedToPaymentP(orderId); // MUST return the promise!
  })
  .then(function (paymentInfo) {
    return showOrderSummaryP(paymentInfo); // MUST return the promise!
  })
  .then(function (orderSummary) {
    return updateWalletBalanceP(orderSummary); // MUST return the promise!
  })
  .then(function (walletUpdated) {
    console.log("Chained result:", walletUpdated);
  })
  .catch(function (error) {
    console.log("Something failed along the chain:", error);
    // ONE single .catch() at the end handles failure from
    // ANY step in the whole chain — a huge improvement over
    // needing a separate failure callback at every level
  });

/*
   NOTICE THE SHAPE OF THIS CODE:
   - grows VERTICALLY (downward), one .then() after another
   - flat, readable, easy to insert/remove a step
   - ONE .catch() at the end catches errors from ANY step
   - no Inversion of Control — WE call .then() on what WE were
     given back, rather than trusting logic buried inside
     someone else's function
*/


/* ------------------------------------------------------------
   PART 8: CRITICAL TIP — ALWAYS RETURN THE PROMISE IN .then()
   ------------------------------------------------------------
   This is the single most common Promise-chaining bug.
   ------------------------------------------------------------ */

/*
   WHY THIS BREAKS:

   When you DON'T return proceedToPaymentP(orderId), the first
   .then() callback finishes WITHOUT returning anything useful —
   in JS, a function with no explicit return gives back `undefined`.

   The NEXT .then() in the chain doesn't wait for
   proceedToPaymentP's promise to settle at all — it just
   immediately receives `undefined` as its input, because that's
   what the PREVIOUS .then() callback actually returned.

   THE FIX: always `return` the promise you create/call inside a
   .then() handler, so the NEXT .then() correctly waits for IT
   to settle and receives ITS resolved value — exactly as done
   correctly in Part 7 above.
*/


/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. Callbacks have two core problems:
        - INVERSION OF CONTROL: you hand your logic to someone
          else's function and must blindly trust how/when/if
          it gets called
        - CALLBACK HELL / PYRAMID OF DOOM: dependent async steps
          nest deeper and deeper, becoming unreadable
   2. A PROMISE is an object representing the eventual completion
      (or failure) of an async operation
   3. Instead of passing a callback IN, you get a promise object
      BACK and ATTACH your handler with .then() — control stays
      with your own code
   4. Every promise has a PromiseState (pending/fulfilled/rejected)
      and a PromiseResult (undefined until settled)
   5. Once settled, a promise is IMMUTABLE — its outcome can
      never change again
   6. PROMISE CHAINING turns the pyramid of doom into flat,
      vertical, readable code, with ONE .catch() handling errors
      from any step in the chain
   7. ALWAYS return the promise inside a .then() handler, or the
      next .then() won't wait for it and will receive `undefined`
      instead of the real resolved value
   ------------------------------------------------------------ */