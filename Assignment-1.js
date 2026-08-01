/*
undefined
20
100
without () print 100
need rev of call bind apply
8 
15
*/

function createBudgetTracker(balance) {
  return {
    spend: function (spent) {
      if (balance - spent < 0) {
        console.log("Insuffecient Balance");
      } else {
        balance -= spent;
      }
    },
    add: function (add) {
      balance += add;
    },
    getbalance: function () {
      console.log(`Balance is ${balance}`);
    },
  };
}
const create=createBudgetTracker(500);
create.getbalance();
create.add(200);
create.getbalance();
create.spend(400);
create.getbalance();
create.getbalance();

const create2=createBudgetTracker(300);
create.getbalance();
create.add(100);
create.getbalance();
create.spend(500);
create.getbalance();

