function fetchUser(id) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error("Invalid User"));
      } else {
        resolve({ id: id, name: "user " + id });
      }
    }, 500); 
  });
}

function fetchOrders(userId, orderList) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: userId, orders: orderList });
    }, 300); 
  });
}

async function getUserWithOrders(id, orderList) {
  try {
    const user = await fetchUser(id);
    // MISTAKE (your version): you named this "userId" even though
    // it holds the WHOLE user object ({ id, name }), not just the
    // id. This is exactly how naming bugs hide in real code — later
    // someone (or future you) reads "userId.name" and gets
    // confused about what's actually stored there. Name variables
    // after what they actually ARE, not after what you expect to
    // extract from them later.
    const orderData = await fetchOrders(user.id, orderList);
    return { user, orders: orderData.orders };
  } catch (err) {
    console.log(err.message);
    // MISTAKE (your version): you logged the error here, but the
    // function then returns undefined implicitly (no return
    // statement in the catch block). The assignment specifically
    // asked for the function to return null on failure, so that
    // WHOEVER CALLS this function can reliably check
    // "if (result === null)" instead of getting an unpredictable
    // undefined that might be confused with "not yet resolved."
    return null;
  }
}

const orderList = ["order1", "order2", "order3"];

// valid id:
getUserWithOrders(5, orderList).then((result) => {
  console.log("Valid id result:", result);
});

// invalid id:
getUserWithOrders(-2, orderList).then((result) => {
  // MISTAKE (your version): you chained BOTH .then() AND .catch()
  // onto fetchans(), expecting .catch() to fire on failure. But
  // your try/catch INSIDE the async function already caught the
  // rejection — by the time .then()/.catch() run on the OUTSIDE,
  // the promise has already resolved successfully (with the value
  // "undefined", or now "null" after the fix), so .catch() never
  // fires. Once an error is caught INSIDE an async function, the
  // async function's own returned promise is no longer rejected —
  // it's just resolved with whatever the catch block returns.
  console.log("Invalid id result:", result); // null
});
