const { use } = require("react");

function fetchUser(id) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error("Invalid User"));
      } else {
        return id;
      }
    }, 2000);
  });
}
function fetchorder(arr) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(arr);
    }, 3000);
  });
}

async function fetchans() {
  try {
    const userId = await fetchUser(id);
    const order = await fetchorder(arr);
    return { id: userId, orders: order };
  } catch (err) {
    console.log(err.message);
  }
}

let arr = ["order1", "order2", "order3", "order4", "order5"];
fetchans();

// weak unable to implement 
