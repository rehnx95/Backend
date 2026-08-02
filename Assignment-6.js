/*
undefined
undefined i do not revise tdz let vs var
NaN
*/

const temps = [30, 25, 40, 15, 35]; // Celsius

temps.forEach((x) => console.log(x * (9 / 5) + 32));
// foreach transform array not giving brand new array

const Fahrenheit = temps.map((x) => x * (9 / 5) + 32);
console.log(Fahrenheit);

// replacing map with foreach give undefine as foreach only tranform

function riskyOperation(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Operation failed"));
      else resolve("Operation succeeded");
    }, 300);
  });
}

async function swallowsError(shouldFail) {
  try {
    const result = await riskyOperation(shouldFail);
    return result;
  } catch (err) {
    console.log(err.message);
    return null;
  }
}
swallowsError(true).then((r) => console.log(r));
swallowsError(true).catch((e) => console.log("caught"));

async function letsErrorPropagate(shouldFail) {
  const result = await riskyOperation(shouldFail);
  return result;
}
letsErrorPropagate(true)
  .then((r) => console.log(r))
  .catch((e) => console.log("caught"));
letsErrorPropagate(true).catch((e) => console.log("caught"));

async function process(id) {
  const name = await fetchUser(id); // holds a whole object, not a name
  const list = await fetchOrders(name.id); // "list" holds an object too, not an array
  return { data: name, extra: list.orders };
}

// name-user
// name.id-user.id
// list-orderlist
// extra-order
// orderlist.orders

function createInventory() {
  let stock = 0;
  return {
    restock: function (stock) {
      stock += stock;
      return stock;
    },
    sell: function (stock) {
      stock -= stock;
    },
    getstock: function () {
      return stock;
    },
  };
}

const inv = createInventory();
console.log(inv.getstock());
console.log(inv.restock(500));
console.log(inv.getstock());

console.log(inv.restock(500));

console.log(inv.getstock());

function getRandomNumber() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(Math.floor(Math.random() * 100)), 200);
  });
}

getRandomNumber().then((r) => console.log(r));

(async () => {
  const result1 = await getRandomNumber();
  console.log(result1);
})();

async function call() {
  const result2 = await getRandomNumber();
  return result2;
}
call().then((r) => console.log(r));

console.log(call());
