/* ============================================================
   PROMISE APIs — all(), allSettled(), race(), any()
   ============================================================
   These handle situations where you have MULTIPLE promises
   running in PARALLEL (not chained one after another) and need
   to combine their results somehow.
   ============================================================ */


/* ------------------------------------------------------------
   SETUP: DUMMY PROMISES WITH DIFFERENT DURATIONS
   ------------------------------------------------------------
   A small helper to create promises that resolve/reject after
   a given delay — mirrors the "custom dummy promises" approach
   from the video, so you can clearly see WHICH one settles
   first/last in each example.
   ------------------------------------------------------------ */

function makePromise(value, delay, outcome) {
  // outcome: "resolve" or "reject" — reads clearly at every call site
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (outcome === "reject") {
        reject(new Error(value + " failed"));
      } else {
        resolve(value);
      }
    }, delay);
  });
}


/* ------------------------------------------------------------
   PART 1: Promise.all() — ALL MUST SUCCEED, FAIL-FAST
   ------------------------------------------------------------
   Runs promises in PARALLEL (not sequentially — all three
   setTimeouts start counting down AT THE SAME TIME, not one
   after another). Waits for ALL to succeed before resolving.
   ------------------------------------------------------------ */

const p1 = makePromise("P1", 3000, "resolve");
const p2 = makePromise("P2", 1000, "resolve");
const p3 = makePromise("P3", 2000, "resolve");

Promise.all([p1, p2, p3])
  .then(function (results) {
    console.log("Promise.all results:", results);
    // ["P1", "P2", "P3"]  <-- after ~3 seconds (the LONGEST delay)
  })
  .catch(function (error) {
    console.log("Promise.all error:", error.message);
  });

/*
   TIMING NOTE: even though P2 (1s) and P3 (2s) finish BEFORE P1
   (3s), Promise.all() does NOT resolve early. It waits for the
   SLOWEST one. The result array preserves the ORIGINAL ORDER you
   passed the promises in — NOT the order they actually finished.
*/

// FAIL-FAST BEHAVIOR — one rejection immediately rejects the whole group:
const p4 = makePromise("P4", 3000, "resolve");
const p5 = makePromise("P5", 1000, "reject"); // rejects after just 1 second!
const p6 = makePromise("P6", 2000, "resolve");

Promise.all([p4, p5, p6])
  .then(function (results) {
    console.log("This will NOT run since p5 rejects");
  })
  .catch(function (error) {
    console.log("Promise.all fail-fast:", error.message);
    // "P5 failed"  <-- fires after only ~1 second, NOT 3!
  });

/*
   WHY "FAIL-FAST": Promise.all() rejects the MOMENT any single
   promise in the array rejects — it does NOT wait for the other
   promises (p4, p6) to finish first, even though they were still
   pending and would have succeeded. This is exactly why it's
   called "fail-fast."

   NOTE: p4 and p6 keep running in the background regardless
   (their setTimeouts don't get cancelled), but Promise.all()
   has already moved on to the .catch() and won't wait to see
   their results.
*/


/* ------------------------------------------------------------
   PART 2: Promise.allSettled() — WAIT FOR ALL, REGARDLESS OF OUTCOME
   ------------------------------------------------------------
   Unlike Promise.all(), this NEVER short-circuits on a
   rejection. It waits for EVERY promise to settle (either way),
   then gives you a full report on each one.
   ------------------------------------------------------------ */

const p7 = makePromise("P7", 3000, "resolve");
const p8 = makePromise("P8", 1000, "reject"); // will reject
const p9 = makePromise("P9", 2000, "resolve");

Promise.allSettled([p7, p8, p9]).then(function (results) {
  console.log("Promise.allSettled results:", results);
  /*
     Output (after ~3 seconds — the LONGEST delay, since it
     waits for ALL of them, including the slow successful ones):

     [
       { status: "fulfilled", value: "P7" },
       { status: "rejected", reason: Error("P8 failed") },
       { status: "fulfilled", value: "P9" }
     ]

     EVERY promise gets a result object:
       - fulfilled ones have a "value" property
       - rejected ones have a "reason" property (the error)
     Nothing is skipped, and there's no .catch() needed here at
     all — allSettled() itself never rejects.
  */
});

/*
   WHEN TO USE allSettled() OVER all():
   Use allSettled() when you want to know the outcome of EVERY
   operation, even if some fail — e.g., uploading 5 files where
   you want to know exactly WHICH ones succeeded and which
   failed, rather than the whole batch being treated as a total
   failure just because ONE upload had a problem.
*/


/* ------------------------------------------------------------
   PART 3: Promise.race() — FIRST TO SETTLE WINS (success OR failure)
   ------------------------------------------------------------
   Returns/rejects with whichever promise settles FIRST —
   doesn't matter if that first one succeeded or failed.
   ------------------------------------------------------------ */

// Race where the FASTEST promise succeeds:
const p10 = makePromise("P10", 3000, "resolve");
const p11 = makePromise("P11", 1000, "resolve"); // fastest — this one wins
const p12 = makePromise("P12", 2000, "resolve");

Promise.race([p10, p11, p12])
  .then(function (result) {
    console.log("Promise.race winner:", result); // "P11" after ~1 sec
  })
  .catch(function (error) {
    console.log("Promise.race error:", error.message);
  });

// Race where the FASTEST promise actually FAILS:
const p13 = makePromise("P13", 3000, "resolve");
const p14 = makePromise("P14", 1000, "reject"); // fastest, but REJECTS
const p15 = makePromise("P15", 2000, "resolve");

Promise.race([p13, p14, p15])
  .then(function (result) {
    console.log("This will NOT run, since the fastest one rejected");
  })
  .catch(function (error) {
    console.log("Promise.race error (fastest failed):", error.message);
    // "P14 failed"  <-- after ~1 sec, even though p13 and p15
    // would have succeeded — race() doesn't care, first one
    // to settle (for ANY reason) wins
  });

/*
   PRACTICAL USE CASE: implementing a TIMEOUT for a slow request —
   race() the actual request against a promise that rejects after
   N seconds; whichever "wins" tells you if you got real data or
   timed out.
*/


/* ------------------------------------------------------------
   PART 4: Promise.any() — FIRST SUCCESS WINS, IGNORES FAILURES
   ------------------------------------------------------------
   Similar to race(), but SPECIFICALLY waits for the first
   SUCCESSFUL promise — rejections are IGNORED (as long as at
   least one promise eventually succeeds).
   ------------------------------------------------------------ */

const p16 = makePromise("P16", 3000, "resolve");
const p17 = makePromise("P17", 1000, "reject"); // fails fast, but IGNORED
const p18 = makePromise("P18", 2000, "resolve"); // succeeds — this "wins"

Promise.any([p16, p17, p18])
  .then(function (result) {
    console.log("Promise.any winner:", result);
    // "P18" after ~2 sec — NOT p17, even though p17 finished
    // FIRST (at 1 sec), because p17 REJECTED. any() skips
    // rejections and keeps waiting for a real success.
  })
  .catch(function (error) {
    console.log("This only runs if ALL promises reject");
  });

// WHAT HAPPENS IF EVERY SINGLE PROMISE FAILS:
const p19 = makePromise("P19", 1000, "reject");
const p20 = makePromise("P20", 2000, "reject");
const p21 = makePromise("P21", 3000, "reject");

Promise.any([p19, p20, p21])
  .then(function (result) {
    console.log("This will never run, all promises reject");
  })
  .catch(function (error) {
    console.log("Promise.any — all failed:", error);
    console.log("error.name:", error.name); // "AggregateError"
    console.log("Individual errors:", error.errors);
    // error.errors is an ARRAY containing all THREE individual
    // rejection reasons: [Error("P19 failed"), Error("P20 failed"), Error("P21 failed")]
    // This is the ONLY situation where Promise.any() actually
    // rejects — when EVERY promise in the group has failed.
  });


/* ------------------------------------------------------------
   PART 5: SIDE-BY-SIDE COMPARISON TABLE (as comments)
   ------------------------------------------------------------

   Promise.all()
     - waits for ALL to succeed
     - rejects IMMEDIATELY if ANY one fails (fail-fast)
     - use when: you need EVERY result, and any failure means
       the whole operation should be treated as failed
       (e.g., loading required data from 3 different APIs before
       rendering a page — if one fails, the page can't render anyway)

   Promise.allSettled()
     - waits for ALL to settle, success or failure, no exceptions
     - NEVER rejects — always gives you a full status report
     - use when: you want to know the outcome of EVERY operation
       independently, and partial success is meaningful
       (e.g., sending 10 emails — you want to know exactly which
       ones failed, not just "something failed")

   Promise.race()
     - returns/rejects with whichever settles FIRST, success or failure
     - use when: you only care about speed, not which one specifically
       (e.g., a timeout pattern — race the real request against a
       timer promise)

   Promise.any()
     - returns the FIRST SUCCESS, ignores failures along the way
     - only rejects (with AggregateError) if ALL promises fail
     - use when: you have multiple redundant sources for the SAME
       data and just need ONE of them to work
       (e.g., trying multiple backup servers/mirrors — use whichever
       responds successfully first, and only fail if ALL of them are down)
   ------------------------------------------------------------ */


/* ------------------------------------------------------------
   QUICK RECAP
   ------------------------------------------------------------
   1. Promise.all()        -> all succeed, or fail-fast on first rejection
   2. Promise.allSettled() -> waits for everything, never rejects,
                               gives {status, value/reason} for each
   3. Promise.race()       -> first to settle wins, success OR failure
   4. Promise.any()        -> first SUCCESS wins, ignores failures,
                               only rejects with AggregateError if
                               EVERY promise fails
   5. All four run promises in PARALLEL — the promises start their
      async work immediately when created, not one after another
   6. Always attach a .catch() (except with allSettled, which
      doesn't need one) to avoid unhandled rejection warnings
   ------------------------------------------------------------ */