// COMPLETE JS SYNTAX REFERENCE — every syntax variant per topic. Not concepts, just every way each thing can be written.

// ===== 1. PROMISES =====

// 1.1 Creating a promise
const p1 = new Promise((resolve, reject) => {
  resolve("value");
});
const p2 = new Promise((resolve, reject) => {
  reject(new Error("failed"));
});

// 1.2 Already-settled shortcuts (no executor needed)
const p3 = Promise.resolve("already resolved");
const p4 = Promise.reject(new Error("already rejected"));
const p5 = Promise.resolve(p1); // resolving with an existing promise just returns it

// 1.3 Consuming with .then()
p1.then((value) => {
  console.log(value);
});
// .then() with TWO args — success handler AND failure handler together
p1.then(
  (value) => console.log("success:", value),
  (error) => console.log("failure:", error)
);

// 1.4 .catch() — shorthand for .then(undefined, errorHandler)
p2.catch((error) => {
  console.log(error.message);
});

// 1.5 .finally() — runs regardless of outcome, gets NO argument
p1.finally(() => {
  console.log("always runs");
});

// 1.6 Chaining all three together
p1
  .then((value) => {
    console.log(value);
    return value + "!";
  })
  .then((value) => {
    console.log(value);
  })
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    console.log("done");
  });

// 1.7 Promise.all() — array in, array out, fails fast
Promise.all([p3, p1, Promise.resolve("x")]).then((results) => {
  console.log(results);
});

// 1.8 Promise.allSettled() — never rejects, gives status objects
Promise.allSettled([p3, p4]).then((results) => {
  console.log(results); // [{status,value}|{status,reason}]
});

// 1.9 Promise.race() — first to settle, win or lose
Promise.race([p3, p4]).then(
  (v) => console.log("won:", v),
  (e) => console.log("lost:", e)
);

// 1.10 Promise.any() — first SUCCESS, ignores failures
Promise.any([p4, p3])
  .then((v) => console.log(v))
  .catch((agg) => console.log(agg.errors)); // agg.errors = all rejection reasons

// 1.11 Promise.try() — wraps sync-or-async code uniformly
Promise.try(() => {
  return "works whether this throws, returns a value, or returns a promise";
}).then((v) => console.log(v));

// 1.12 Inspecting a promise's state — console/devtools only, no direct API
console.log(p1); // Promise {<fulfilled>: 'value'}


// ===== 2. ASYNC/AWAIT =====

// 2.1 async function declaration
async function fn1() {
  return "value";
}

// 2.2 async function expression
const fn2 = async function () {
  return "value";
};

// 2.3 async arrow function
const fn3 = async () => {
  return "value";
};

// 2.4 async arrow, implicit return
const fn4 = async () => "value";

// 2.5 async method inside an object
const obj1 = {
  async getData() {
    return "value";
  },
};

// 2.6 async method inside a class (incl. static)
class Fetcher {
  async getData() {
    return "value";
  }
  static async getStaticData() {
    return "static value";
  }
}

// 2.7 IIAFE — Immediately Invoked Async Function Expression
(async () => {
  const result = await fn1();
  console.log(result);
})();

// 2.8 sequential awaits
async function sequential() {
  const a = await fn1();
  const b = await fn2();
  console.log(a, b);
}

// 2.9 parallel awaits via Promise.all
async function parallel() {
  const [a, b] = await Promise.all([fn1(), fn2()]);
  console.log(a, b);
}

// 2.10 try/catch/finally around await
async function withErrorHandling() {
  try {
    const result = await fn1();
    console.log(result);
  } catch (error) {
    console.log(error.message);
  } finally {
    console.log("cleanup");
  }
}

// 2.11 await inside a for loop — sequential, one at a time
async function loopSequential() {
  const items = [fn1(), fn2(), fn3()];
  for (const item of items) {
    const result = await item;
    console.log(result);
  }
}

// 2.12 for-await-of — iterating ASYNC iterators/generators
async function* asyncGenerator() {
  yield 1;
  yield 2;
  yield 3;
}
async function consumeAsyncGenerator() {
  for await (const value of asyncGenerator()) {
    console.log(value);
  }
}

// 2.13 Top-level await — allowed ONLY at the top level of ES modules, no wrapper needed
// const data = await fn1();


// ===== 3. CLOSURES — every syntax form that creates one =====

// 3.1 function returning a function
function outer1() {
  let count = 0;
  return function () {
    return ++count;
  };
}

// 3.2 arrow returning an arrow
const outer2 = () => {
  let count = 0;
  return () => ++count;
};

// 3.3 IIFE forming a closure (module pattern)
const counterModule = (function () {
  let count = 0;
  return {
    increment: () => ++count,
    reset: () => (count = 0),
  };
})();
console.log(counterModule.increment()); // 1

// 3.4 closure via setTimeout callback
function delayedGreeting(name) {
  setTimeout(() => {
    console.log("Hello, " + name);
  }, 100);
}

// 3.5 closure via array method callback
function multiplyAllBy(factor) {
  return [1, 2, 3].map((n) => n * factor);
}

// 3.6 closure returning an object of functions
function createBankAccount(balance) {
  return {
    deposit: (amount) => (balance += amount),
    getBalance: () => balance,
  };
}


// ===== 4. FUNCTIONS — every declaration syntax =====

// 4.1 function declaration
function declared() {}

// 4.2 function expression
const expr = function () {};

// 4.3 named function expression
const namedExpr = function innerName() {};

// 4.4 arrow function, no params
const arrow1 = () => {};

// 4.5 arrow function, one param — parens optional
const arrow2 = (x) => {};
const arrow3 = x => {};

// 4.6 arrow function, multiple params — parens required
const arrow4 = (x, y) => {};

// 4.7 arrow function, implicit return
const arrow5 = (x) => x * 2;

// 4.8 arrow function returning an object literal — needs wrapping parens!
const arrow6 = (x) => ({ value: x });

// 4.9 default parameters
function withDefaults(a, b = 10) {
  return a + b;
}

// 4.10 rest parameters
function withRest(first, ...rest) {
  console.log(first, rest);
}

// 4.11 destructured parameters
function withDestructured({ x, y }) {
  console.log(x, y);
}

// 4.12 destructured parameters with default values
function withDestructuredDefaults({ x = 0, y = 0 } = {}) {
  console.log(x, y);
}

// 4.13 generator function
function* generatorFn() {
  yield 1;
  yield 2;
}

// 4.14 IIFE — Immediately Invoked Function Expression
(function () {
  console.log("runs immediately");
})();
(() => {
  console.log("runs immediately too"); // arrow version
})();

// 4.15 method shorthand inside an object — no "function" keyword needed
const objWithMethod = {
  greet() {
    console.log("hi");
  },
};


// ===== 5. CALLBACKS — every syntax form for passing a function in =====

// 5.1 named function passed by reference
function myCallback(value) {
  console.log(value);
}
[1, 2, 3].forEach(myCallback);

// 5.2 anonymous function expression passed inline
[1, 2, 3].forEach(function (value) {
  console.log(value);
});

// 5.3 arrow function passed inline — most common in modern code
[1, 2, 3].forEach((value) => {
  console.log(value);
});

// 5.4 arrow function, implicit return, passed inline
const doubled = [1, 2, 3].map((n) => n * 2);

// 5.5 callback receiving multiple arguments — array methods give more than just the value
[1, 2, 3].forEach((value, index, fullArray) => {
  console.log(value, index, fullArray);
});

// 5.6 error-first callback pattern — classic Node-style API
function readFileCallback(err, data) {
  if (err) {
    console.log("Error:", err);
    return;
  }
  console.log("Data:", data);
}
// fs.readFile("file.txt", readFileCallback); // usage needs Node fs module


// ===== 6. setTimeout / setInterval =====

// 6.1 basic setTimeout
const id1 = setTimeout(() => console.log("fires once"), 1000);

// 6.2 extra arguments passed to the callback
setTimeout((a, b) => console.log(a, b), 1000, "arg1", "arg2");

// 6.3 clearTimeout — cancels a pending setTimeout
clearTimeout(id1);

// 6.4 setInterval — repeats every N ms until cleared
const intervalId = setInterval(() => console.log("tick"), 1000);

// 6.5 clearInterval — stops a running setInterval
clearInterval(intervalId);

// 6.6 setTimeout(fn, 0) — schedules for "as soon as possible", still async
setTimeout(() => console.log("runs after current sync code"), 0);

// 6.7 recursive setTimeout — waits for each call to fully finish before scheduling next
function poll() {
  setTimeout(() => {
    console.log("polling...");
    poll();
  }, 1000);
}


// ===== 7. `this` — every syntax context it appears in =====

// 7.1 this in a regular function
function regularThis() {
  console.log(this);
}

// 7.2 this in an object method
const objThis = {
  name: "obj",
  method() {
    console.log(this);
  },
};

// 7.3 this in an arrow function — inherits from enclosing scope
const arrowThis = () => {
  console.log(this);
};

// 7.4 this.call(thisArg, arg1, arg2, ...)
function greetCall(greeting) {
  console.log(greeting + ", " + this.name);
}
greetCall.call({ name: "Rehan" }, "Hi");

// 7.5 this.apply(thisArg, [argsArray])
greetCall.apply({ name: "Rehan" }, ["Hi"]);

// 7.6 this.bind(thisArg, arg1, arg2, ...) — returns a NEW function
const boundGreet = greetCall.bind({ name: "Rehan" }, "Hi");
boundGreet(); // called later, "this" already locked in

// 7.7 this inside a class constructor
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log("Hi, " + this.name);
  }
}

// 7.8 this inside a class arrow-function field — auto-bound, no .bind() needed
class Button {
  label = "Click me";
  handleClick = () => {
    console.log(this.label);
  };
}

// 7.9 globalThis — universal reference to the global object, same in browser AND Node
console.log(globalThis);


// ===== 8. OBJECTS — every syntax form =====

// 8.1 object literal
const o1 = { a: 1, b: 2 };

// 8.2 shorthand property names
const a = 1, b = 2;
const o2 = { a, b };

// 8.3 computed property names
const key = "dynamicKey";
const o3 = { [key]: "value" };

// 8.4 method shorthand
const o4 = {
  greet() {
    console.log("hi");
  },
};

// 8.5 getter and setter syntax
const o5 = {
  _value: 0,
  get value() {
    return this._value;
  },
  set value(newValue) {
    this._value = newValue;
  },
};
o5.value = 10; // uses the setter
console.log(o5.value); // uses the getter -> 10

// 8.6 spread into a new object
const o6 = { ...o1, c: 3 };

// 8.7 Object.freeze / Object.isFrozen
const o7 = Object.freeze({ a: 1 });
console.log(Object.isFrozen(o7));

// 8.8 Object.keys / values / entries / fromEntries
console.log(Object.keys(o1));
console.log(Object.values(o1));
console.log(Object.entries(o1));
console.log(Object.fromEntries([["a", 1], ["b", 2]])); // reverse of entries()

// 8.9 optional chaining
const o8 = { nested: { value: 5 } };
console.log(o8?.nested?.value); // 5
console.log(o8?.missing?.value); // undefined, no error thrown

// 8.10 nullish coalescing — pairs commonly with optional chaining
console.log(o8?.missing?.value ?? "default"); // "default"

// 8.11 object destructuring with rename + default together
const { a: renamedA = 99 } = {};
console.log(renamedA); // 99


// ===== 9. ARRAYS — every syntax form =====

// 9.1 array literal
const arr1 = [1, 2, 3];

// 9.2 Array constructor
const arr2 = new Array(1, 2, 3); // [1, 2, 3]
const arr3 = new Array(5); // length-5 array, all empty slots (quirk!)

// 9.3 Array.of() — avoids the Array constructor's single-number quirk
const arr4 = Array.of(5); // [5], not a length-5 empty array

// 9.4 Array.from() — builds an array from an iterable or array-like
const arr5 = Array.from("abc"); // ['a', 'b', 'c']
const arr6 = Array.from({ length: 3 }, (_, i) => i * 2); // [0, 2, 4]

// 9.5 Array.isArray()
console.log(Array.isArray(arr1)); // true

// 9.6 spread to copy/combine
const arr7 = [...arr1, ...arr2];

// 9.7 destructuring with skip and rest
const [, second, ...restArr] = [1, 2, 3, 4];

// 9.8 chained array methods
const result = [1, 2, 3, 4, 5]
  .filter((n) => n % 2 === 0)
  .map((n) => n * 10)
  .reduce((acc, curr) => acc + curr, 0);

// 9.9 flat() and flatMap()
const nested = [1, [2, 3], [4, [5, 6]]];
console.log(nested.flat()); // [1, 2, 3, 4, [5, 6]] — one level deep by default
console.log(nested.flat(Infinity)); // fully flattened
const flatMapped = [1, 2, 3].flatMap((n) => [n, n * 2]); // [1,2, 2,4, 3,6]

// 9.10 Array.prototype.at() — supports negative indexing
console.log(arr1.at(-1)); // last element, same as arr1[arr1.length - 1]


/* RECAP
1. Promises: new Promise(), .then/.catch/.finally, Promise.all/allSettled/race/any/try/resolve/reject
2. async/await: works on declarations, expressions, arrows, object methods, class methods, IIFEs,
   generators (for-await-of); top-level await only inside ES modules
3. Closures form via ANY nested function — returned fns, IIFEs, timers, array callbacks, fn-objects
4. Functions: 15 distinct declaration syntaxes — differences matter for hoisting and "this" binding
5. Callbacks: named ref, inline anonymous, inline arrow, or the classic error-first pattern
6. Timers: setTimeout/setInterval + clear* counterparts, plus recursive-setTimeout polling
7. this: 9 contexts, including the arrow class-field trick that auto-binds without .bind()
8. Objects: getters/setters, computed keys, optional chaining (?.), nullish coalescing (??), Object.*
9. Arrays: multiple construction methods, flat/flatMap, and .at() for negative indexing
*/