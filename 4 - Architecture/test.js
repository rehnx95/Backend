// // simple-test.js
// // Plain Node.js test script — no Jest, no Supertest.
// // Run with: node simple-test.js
// // (make sure JWT_SECRET is set, e.g. via a .env file loaded by dotenv,
// //  or just hardcode one below for local testing)

// process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

// const assert = require("assert");
// const userRepository = require("./repository/userRepository");
// const taskRepository = require("./repository/taskRepository");
// const userService = require("./services/userService");
// const taskService = require("./services/taskService");

// let passed = 0;
// let failed = 0;

// async function test(name, fn) {
//   try {
//     await fn();
//     console.log(`✅ PASS: ${name}`);
//     passed++;
//   } catch (err) {
//     console.log(`❌ FAIL: ${name}`);
//     console.log(`   ${err.message}`);
//     failed++;
//   }
// }

// function resetDB() {
//   userRepository._reset();
//   taskRepository._reset();
// }

// async function run() {
//   // ---------- USERS ----------
//   resetDB();

//   await test("signup creates 5 users", async () => {
//     const users = [
//       { email: "alice@example.com", password: "alice123" },
//       { email: "bob@example.com", password: "bobpass1" },
//       { email: "carol@example.com", password: "carolpw1" },
//       { email: "dave@example.com", password: "davepass" },
//       { email: "erin@example.com", password: "erinpass" },
//     ];
//     for (const u of users) {
//       const res = await userService.signup(u.email, u.password);
//       assert.strictEqual(res.success, true);
//     }
//     assert.strictEqual(userRepository.count(), 5);
//   });

//   await test("signup rejects duplicate email", async () => {
//     const res = await userService.signup("alice@example.com", "alice123");
//     assert.strictEqual(res.success, false);
//     assert.strictEqual(res.error, "Email Already Exist");
//   });

//   await test("login succeeds with correct password", async () => {
//     const res = await userService.login("alice@example.com", "alice123");
//     assert.strictEqual(res.success, true);
//     assert.ok(res.token, "expected a token");
//   });

//   await test("login fails with wrong password", async () => {
//     const res = await userService.login("alice@example.com", "wrongpass");
//     assert.strictEqual(res.success, false);
//     assert.strictEqual(res.error, "Unauthorize");
//   });

//   await test("login fails for non-existent user", async () => {
//     const res = await userService.login("ghost@example.com", "whatever1");
//     assert.strictEqual(res.success, false);
//   });

//   // ---------- TASKS ----------
//   resetDB();

//   await test("signup 3 users then create 9 tasks linked to them", async () => {
//     await userService.signup("alice@example.com", "alice123");
//     await userService.signup("bob@example.com", "bobpass1");
//     await userService.signup("carol@example.com", "carolpw1");

//     const aliceId = 1, bobId = 2, carolId = 3;

//     ["Buy milk", "Walk dog", "Write report", "Fix bug"].forEach((t) =>
//       taskService.createTask(aliceId, t)
//     );
//     ["Read book", "Plan trip", "Call mom"].forEach((t) =>
//       taskService.createTask(bobId, t)
//     );
//     ["Refactor code", "Deploy app"].forEach((t) =>
//       taskService.createTask(carolId, t)
//     );

//     assert.strictEqual(taskRepository.count(), 9);
//     assert.strictEqual(taskService.getTask(aliceId).total, 4);
//     assert.strictEqual(taskService.getTask(bobId).total, 3);
//     assert.strictEqual(taskService.getTask(carolId).total, 2);
//   });

//   await test("getoneTask returns the right task", async () => {
//     const outcome = taskService.getoneTask(1);
//     assert.strictEqual(outcome.task.title, "Buy milk");
//   });

//   await test("updateTask changes the title", async () => {
//     taskService.updateTask(1, "Buy oat milk");
//     const outcome = taskService.getoneTask(1);
//     assert.strictEqual(outcome.task.title, "Buy oat milk");
//   });

//   await test("deleteTask removes the task", async () => {
//     taskService.deleteTask(1);
//     const outcome = taskService.getoneTask(1);
//     assert.strictEqual(outcome.task, undefined);
//     assert.strictEqual(taskRepository.count(), 8);
//   });

//   await test("pagination returns correct page size", async () => {
//     const page1 = taskService.getTask(2, 1, 2); // bob, page 1, limit 2
//     assert.strictEqual(page1.data.length, 2);
//     assert.strictEqual(page1.totalPages, 2);
//   });

//   // ---------- KNOWN BUG DEMO ----------
//   await test("BUG DEMO: task id collision after delete (count()+1 strategy)", async () => {
//     resetDB();
//     await userService.signup("dave@example.com", "davepass");
//     const daveId = 1;

//     taskService.createTask(daveId, "First");  // id 1
//     taskService.createTask(daveId, "Second"); // id 2
//     taskService.createTask(daveId, "Third");  // id 3
//     assert.strictEqual(taskRepository.count(), 3);

//     taskService.deleteTask(2); // count() drops to 2
//     assert.strictEqual(taskRepository.count(), 2);

//     taskService.createTask(daveId, "Fourth"); // gets id 3 -> collides with "Third"

//     const ids = taskService.getTask(daveId).data.map((t) => t.id);
//     const hasDuplicate = new Set(ids).size !== ids.length;
//     assert.strictEqual(hasDuplicate, true, "expected an id collision to occur");

//     // "Fourth" is now unreachable by its own id -> getoneTask(3) returns "Third"
//     const clash = taskService.getoneTask(3);
//     assert.strictEqual(clash.task.title, "Third");
//   });

//   // ---------- SUMMARY ----------
//   console.log(`\n${passed} passed, ${failed} failed`);
//   process.exit(failed > 0 ? 1 : 0);
// }

// run();

// simple-test.js
// Plain Node.js test script — no Jest, no Supertest.
// Run with: node simple-test.js
// (make sure JWT_SECRET is set, e.g. via a .env file loaded by dotenv,
//  or just hardcode one below for local testing)

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";

const assert = require("assert");
const userRepository = require("./repository/userRepository");
const taskRepository = require("./repository/taskRepository");
const userService = require("./services/userService");
const taskService = require("./services/taskService");

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   ${err.message}`);
    failed++;
  }
}

function resetDB() {
  userRepository._reset();
  taskRepository._reset();
}

async function run() {
  // ---------- USERS ----------
  resetDB();

  await test("signup creates 5 users", async () => {
    const users = [
      { email: "alice@example.com", password: "alice123" },
      { email: "bob@example.com", password: "bobpass1" },
      { email: "carol@example.com", password: "carolpw1" },
      { email: "dave@example.com", password: "davepass" },
      { email: "erin@example.com", password: "erinpass" },
    ];
    for (const u of users) {
      const res = await userService.signup(u.email, u.password);
      assert.strictEqual(res.success, true);
    }
    assert.strictEqual(userRepository.count(), 5);
  });

  await test("signup rejects duplicate email", async () => {
    const res = await userService.signup("alice@example.com", "alice123");
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, "Email Already Exist");
  });

  await test("login succeeds with correct password", async () => {
    const res = await userService.login("alice@example.com", "alice123");
    assert.strictEqual(res.success, true);
    assert.ok(res.token, "expected a token");
  });

  await test("login fails with wrong password", async () => {
    const res = await userService.login("alice@example.com", "wrongpass");
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error, "Unauthorize");
  });

  await test("login fails for non-existent user", async () => {
    const res = await userService.login("ghost@example.com", "whatever1");
    assert.strictEqual(res.success, false);
  });

  // ---------- TASKS ----------
  resetDB();

  await test("signup 3 users then create 9 tasks linked to them", async () => {
    await userService.signup("alice@example.com", "alice123");
    await userService.signup("bob@example.com", "bobpass1");
    await userService.signup("carol@example.com", "carolpw1");

    const aliceId = 1, bobId = 2, carolId = 3;

    ["Buy milk", "Walk dog", "Write report", "Fix bug"].forEach((t) =>
      taskService.createTask(aliceId, t)
    );
    ["Read book", "Plan trip", "Call mom"].forEach((t) =>
      taskService.createTask(bobId, t)
    );
    ["Refactor code", "Deploy app"].forEach((t) =>
      taskService.createTask(carolId, t)
    );

    assert.strictEqual(taskRepository.count(), 9);
    assert.strictEqual(taskService.getTask(aliceId).total, 4);
    assert.strictEqual(taskService.getTask(bobId).total, 3);
    assert.strictEqual(taskService.getTask(carolId).total, 2);
  });

  await test("getoneTask returns the right task", async () => {
    const outcome = taskService.getoneTask(1);
    assert.strictEqual(outcome.task.title, "Buy milk");
  });

  await test("updateTask changes the title", async () => {
    taskService.updateTask(1, "Buy oat milk");
    const outcome = taskService.getoneTask(1);
    assert.strictEqual(outcome.task.title, "Buy oat milk");
  });

  await test("deleteTask removes the task", async () => {
    taskService.deleteTask(1);
    const outcome = taskService.getoneTask(1);
    assert.strictEqual(outcome.task, undefined);
    assert.strictEqual(taskRepository.count(), 8);
  });

  await test("pagination returns correct page size", async () => {
    const page1 = taskService.getTask(2, 1, 2); // bob, page 1, limit 2
    assert.strictEqual(page1.data.length, 2);
    assert.strictEqual(page1.totalPages, 2);
  });

  // ---------- KNOWN BUG DEMO ----------
  await test("BUG DEMO: task id collision after delete (count()+1 strategy)", async () => {
    resetDB();
    await userService.signup("dave@example.com", "davepass");
    const daveId = 1;

    taskService.createTask(daveId, "First");  // id 1
    taskService.createTask(daveId, "Second"); // id 2
    taskService.createTask(daveId, "Third");  // id 3
    assert.strictEqual(taskRepository.count(), 3);

    taskService.deleteTask(2); // count() drops to 2
    assert.strictEqual(taskRepository.count(), 2);

    taskService.createTask(daveId, "Fourth"); // gets id 3 -> collides with "Third"

    const ids = taskService.getTask(daveId).data.map((t) => t.id);
    const hasDuplicate = new Set(ids).size !== ids.length;
    assert.strictEqual(hasDuplicate, true, "expected an id collision to occur");

    // "Fourth" is now unreachable by its own id -> getoneTask(3) returns "Third"
    const clash = taskService.getoneTask(3);
    assert.strictEqual(clash.task.title, "Third");
  });

  // ---------- SUMMARY ----------
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run();