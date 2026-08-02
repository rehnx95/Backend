function createUserStore() {
  let users = [];
  let nextId = 1;

  return {
    addUser: function (userData) {
      const newUser = { id: nextId, ...userData };
      users.push(newUser);
      nextId++;
      return newUser;
    },
    getUserById: function (id) {
      return users.find((u) => u.id === id); // find() returns ONE object or
      // undefined — your original used filter(), which returns an
      // ARRAY (even if it has just one item). Not a bug exactly,
      // but find() is the more correct tool for "get exactly one
      // matching item," matching what the assignment asked for.
    },
    getAllUsers: function () {
      return users;
    },
    deleteUser: function (id) {
      const originalLength = users.length;
      users = users.filter((u) => u.id !== id);
      // MISTAKE (your version): you wrote "id--" here, intending to
      // roll back the auto-increment counter. But "id" here is the
      // FUNCTION'S PARAMETER (whatever id was passed in to delete),
      // NOT the closure's "nextId" counter used in addUser — these
      // are two completely different variables that happen to have
      // similar names. Decrementing the parameter does nothing
      // useful at all. The FIX is simpler than trying to repair
      // it: just don't touch nextId on delete. New users should
      // keep getting fresh, never-reused ids, even after a
      // deletion — reusing ids after deletes is what actually
      // causes bugs (e.g. two different "user #3"s existing at
      // different points in time).
      return users.length < originalLength; // true if something was removed
    },
  };
}

function simulateSignup(store, userData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { name, email } = userData;
      if (name && email) {
        resolve(store.addUser(userData));
      } else {
        reject(new Error("Invalid user: name and email are both required"));
      }
    }, 500);
  });
}
// MISTAKE (your version): simulateSignup() used the OUTER "user"
// variable directly (store.addUser(userData) was store's own
// closure, fine) — but note your ORIGINAL code called
// user.addUser(userData) referencing a store from OUTSIDE the
// function entirely, meaning simulateSignup could only EVER work
// with that one hardcoded store. Passing "store" in as a PARAMETER
// (as done here, and as the assignment asked) makes this function
// reusable with ANY store, not locked to one global instance.

async function runSignupFlow() {
  const store = createUserStore();

  const signups = [
    { name: "Rehan", email: "rehan@example.com" },
    { name: "Alok" }, // deliberately invalid — missing email
    { name: "Ashish", email: "ashish@example.com" },
  ];

  for (const userData of signups) {
    try {
      const newUser = await simulateSignup(store, userData);
      console.log("Signed up:", newUser);
    } catch (err) {
      console.log("Signup failed:", err.message);
      // try/catch INSIDE the loop means one failure doesn't stop
      // the loop — the next iteration still runs
    }
  }

  console.log("Final users in store:", store.getAllUsers());
}

runSignupFlow();
// MISTAKE (your version): you called simulateSignup() directly and
// did `console.log(simulate)` immediately — but simulateSignup()
// RETURNS A PROMISE, so that line just logs "Promise {<pending>}",
// not the actual result. You also never wrote runSignupFlow() at
// all, which was the actual point of the assignment (running
// THREE signups, with error handling around EACH one individually,
// then showing the final state). Always either .then() a promise,
// or await it inside an async function, before trying to log its
// resolved value — logging the promise object itself is one of the
// most common beginner mistakes with async code.


