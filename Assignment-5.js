function createUserStore() {
  let users = [];
  let id = 1;
  return {
    addUser: function (obj) {
      obj.id = id;
      users.push(obj);
      console.log(this.getUser(id));
      id++;
    },
    getUser: function (id) {
      return users.filter((x) => x.id === id);
    },
    getAllUser: function () {
      return users;
    },
    deleteUser: function (id) {
      users = users.filter((x) => x.id !== id);
      id--;
    },
  };
}
let ob = {
  name: "rehan",
  emai: "rehan2",
};
const user = createUserStore();
// console.log(user.addUser(ob));
// console.log(user.getAllUser());
// console.log(user.getUser(1));

function simulateSignup(userData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { name, email } = userData;
      if (name && email) {
        resolve(userData.addUser(userData));
      } else {
        reject(new Error("Invalid User"));
      }
    }, 1000);
  });
}

simulateSignup(ob);
