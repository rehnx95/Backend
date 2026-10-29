let date = new Date();
console.log(`start at ${date.toTimeString()}`);
setTimeout(() => {
  console.log(`timeout run at ${date.toTimeString()} `);
},1000);
for (let i = 0; i < 100; i++) {
  console.log(`run at ${date.toTimeString()}`);
}
