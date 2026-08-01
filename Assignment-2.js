/*
1
4
3
5
2
var loop:3
var loop:3
var loop:3
let loop:0
let loop:1
let loop:2
first console log then promise then settimeout with 0 second then var loop then let loop
*/
function delayedSequence(items) {
  for (let i = 0; i < items.length; i++) {
    setTimeout(() => {
      console.log(`items[${i}] at ${i}s time is ${new Date().toTimeString()}`);
    }, i * 1000);
  }
}
let arr=["item1","item2","item3","item4","item5",]
delayedSequence(arr);
