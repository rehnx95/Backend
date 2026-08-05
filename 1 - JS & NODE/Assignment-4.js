const products = [
  {
    id: 1,
    name: "Laptop",
    price: 55000,
    category: "electronics",
    inStock: true,
  },
  { id: 2, name: "Desk", price: 8000, category: "furniture", inStock: false },
  { id: 3, name: "Mouse", price: 500, category: "electronics", inStock: true },
  { id: 4, name: "Chair", price: 4500, category: "furniture", inStock: true },
  {
    id: 5,
    name: "Monitor",
    price: 12000,
    category: "electronics",
    inStock: false,
  },
];

const inStockNames = products
  .filter((p) => p.inStock === true)
  .map((p) => p.name);
  // MISTAKE (your version): your .map() callback did
  // `console.log(y.name)` but had NO return statement — so map()
  // collected "undefined" for every item (since a function with no
  // explicit return gives back undefined). map() is for
  // TRANSFORMING each element into something new that you RETURN;
  // if you just want to print each one as a side effect with no
  // new array needed, that's what forEach() is for, not map().
console.log(inStockNames); // ["Laptop", "Mouse", "Chair"]

const totalprice = products
  .filter((x) => x.inStock === true)
  .reduce((acc, curr) => {
    return acc + curr.price;
  }, 0);
console.log(totalprice);

const Group = products.reduce(
  (acc, curr) => {
    if (curr.category === "electronics") {
      acc.electronics.push(curr);
    } else {
      acc.furniture.push(curr);
    }
    return acc;
  },
  { electronics: [], furniture: [] },
);
console.log(Group);

const expensive = products.reduce((acc, curr) => {
  if (curr.price > acc) {
    return curr;
  } else {
    return acc;
  }
}, products[0]);
console.log(expensive);
