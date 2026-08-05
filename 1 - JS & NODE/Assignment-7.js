/*
underfined
welcome to undefined
*/

const rawOrders = [
  {
    orderId: 1,
    customer: "Alok",
    items: [
      { name: "Pen", price: 20, qty: 5 },
      { name: "Notebook", price: 60, qty: 2 },
    ],
  },
  {
    orderId: 2,
    customer: "Ashish",
    items: [{ name: "Bag", price: 800, qty: 1 }],
  },
  { orderId: 3, customer: "Ankit", items: [] }, // deliberately empty — no items
  {
    orderId: 4,
    customer: "Pranav",
    items: [
      { name: "Bottle", price: 150, qty: 3 },
      { name: "Pen", price: 20, qty: 10 },
    ],
  },
];

function calculateOrderTotal(order) {
  const itemarray = order.items;
  // console.log(itemarray)
  const price = itemarray.map((x) => x.price * x.qty);
  // console.log(price)
  const totalprice = price.reduce((acc, curr) => {
    return acc + curr;
  }, 0);
  // console.log(totalprice)
  return totalprice;
}
console.log(calculateOrderTotal(rawOrders[2]));

// logic based

function applyToEachOrder2(orders, logic) {
  let ans = [];
  for (let i = 0; i < orders.length; i++) {
    ans.push(logic(orders[i]));
  }
  return ans;
}
console.log(applyToEachOrder2(rawOrders, calculateOrderTotal));

function createOrderLogger() {
  let log = [];
  return {
    record: function (entry) {
      log.push(entry);
    },
    getlog: function () {
      return log;
    },
    printlog: function (formatterCallback) {
      for (let i = 0; i < log.length; i++) {
        console.log(formatterCallback(log[i]));
      }
    },
  };
}

function formatterCallback(entry) {
  return `[LOG] ${entry}`;
}

const myLogger = createOrderLogger();

myLogger.record("Order 101 placed by Alok");
myLogger.record("Payment received for Order 102");
myLogger.record("Order 103 items are out of stock");

myLogger.printlog(formatterCallback);
console.log(myLogger.getlog());

async function validateOrder(order) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (order.items.length === 0) {
        reject(new Error(`Invalid Order for ${order.customer}`));
      } else {
        resolve(order);
      }
    }, 500);
  });
}

async function processOrder(order, logger) {
  let validatedOrder = await validateOrder(order);
  const total = calculateOrderTotal(validatedOrder);
  const { customer } = validatedOrder;
  logger.record(`Processed Order For ${customer}. Total: ₹$${total}`);
  return { customer, total };
}
processOrder(rawOrders[0], myLogger).then((r) => console.log(r));

async function processAllOrders(orders, logger) {
  const promises = orders.map((order) => processOrder(order, logger));
  const settle = await Promise.allSettled(promises);
  return settle.map((x) => x.value || x.reason);
}
processAllOrders(rawOrders, myLogger).then((r) => console.log(r));

function createOrderCounter() {
  const counterobj = {
    count: 0,
    recordOrder: function (count) {
      this.count++; 
    },
    getCount: function () {
      return this.count;
    },
  };
  return counterobj;
}

const create = createOrderCounter();
create.recordOrder(1);
create.recordOrder(5);
create.recordOrder(1);
create.recordOrder(4);

console.log(create.getCount()); 



