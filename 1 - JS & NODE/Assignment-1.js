/*
   CORRECTED PREDICTIONS:
   undefined
   NaN                  <- MISTAKE: you predicted 20. Hoisting only
                           allocates memory (undefined) during the
                           memory phase — it does NOT run the
                           assignment early. When getValue() runs,
                           "a" is STILL undefined (the "var a = 10"
                           line hasn't executed yet), so
                           undefined * 2 = NaN, not 20.
   100
   undefined            <- detached() called with no object before
                           the dot -> "this" is NOT obj -> this.value
                           is undefined (or throws in strict mode)
   100                  <- .call(obj) forces "this" back to obj
   8
   15
*/

function mystery() {
  console.log(a); // undefined
  console.log(getValue()); // NaN — see explanation above
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
console.log(obj.getValue()); // 100
console.log(detached()); // undefined (or error) — called plainly, no "this"
console.log(detached.call(obj)); // 100 — "this" manually restored

function makeAdder(x) {
  return function (y) {
    return x + y;
  };
}
const add5 = makeAdder(5);
console.log(add5(3)); // 8
console.log(add5(10)); // 15

/* ------------------------------------------------------------
   SUMMARY OF THE ACTUAL PATTERNS TO INTERNALIZE
   ------------------------------------------------------------
   1. Hoisting gives UNDEFINED at the memory phase, not the
      eventual value — don't assume a variable "already has its
      value" just because it was declared earlier in the file
   2. map() must RETURN something per element — if you're just
      doing a side effect (like printing), use forEach() instead
   3. Once an async function's try/catch handles an error, the
      function's OWN returned promise is no longer rejected —
      outside .catch() chains won't fire anymore after that
   4. Name variables after what they actually hold, not what
      you plan to extract from them later
   5. A closure's private variable and a function's PARAMETER can
      have similar names but are completely different variables —
      don't assume touching one affects the other
   6. Logging a promise directly shows "Promise {<pending>}" —
      always await it or chain .then() before expecting the
      resolved value
   ------------------------------------------------------------ */