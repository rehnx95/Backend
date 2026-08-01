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

const instock = products
  .filter((x) => x.inStock === true)
  .map((y) => {
    console.log(y.name);
  });
console.log(instock);

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

// 5 is not done
