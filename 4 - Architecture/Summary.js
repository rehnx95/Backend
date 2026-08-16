/*
=====================================================================
 STEP 4 — FULL SUMMARY & MISTAKE LOG (for revision)
 Covers: auth system, tasks REST resource, all bugs found across
 both sessions, and the core lessons behind each one.
=====================================================================
*/


/* =====================================================================
   1. WHAT YOU BUILT INDEPENDENTLY, BEFORE ANY HELP
   ---------------------------------------------------------------
   Came in already having built, on your own between sessions, a
   complete controller-service-repository JWT auth system: signup/
   login controllers, Zod validation on signup, bcrypt hashing, JWT
   signing/verifying middleware, a protected /profile route. A real,
   correctly-structured backend feature, not a toy.

   Also independently REBUILT the same auth system from memory
   TWICE later (once mid-session, once the next morning) - without
   copying earlier code - both times tested with real automated
   scripts.

   Worth remembering: you CAN design and build a multi-layer feature
   from scratch without hand-holding. The struggle was never ability
   - it was specific, nameable gaps (see below).
===================================================================== */


/* =====================================================================
   2. WHAT WAS BUILT TOGETHER (tasks REST resource)
   ---------------------------------------------------------------
   taskRepository.js, taskService.js, taskController.js, routes wired
   into server.js. Full CRUD: create, list (with real pagination),
   get-one, update, delete - all with ownership checks, all with
   Zod validation on writes, all covered by real test scripts
   (happy paths + 400/401/404 edge cases).

   You wrote nearly every line yourself; bugs were mostly found by
   being pointed at the right AREA, not handed the fix outright.
   Two fixes (pagination code, timing-attack fix) were given
   directly after you asked for the code - worth noting as the
   exception, not the norm.
===================================================================== */


/* =====================================================================
   3. FULL BUG LIST - EVERY REAL MISTAKE, IN ORDER
   ---------------------------------------------------------------
   Step 3 (raw server / Express foundation)
===================================================================== */

// BUG 1 - status code lied about outcome
// 404 route was returning statusCode = 200 instead of 404.
// LESSON: status code must always match what actually happened.

// BUG 2 - wrong console method
// console.timeLog(req.headers) used instead of console.log().
// timeLog expects a TIMER LABEL (paired with console.time()), not
// an object - caused repeated "No such label" warnings.
// LESSON: know what a method actually expects before using it.

// BUG 3 - temporal dead zone crash
// app.use(express.json()) was called BEFORE `const app = express()`
// existed further down the file.
// LESSON: a const can't be used before its own declaration line runs.

// BUG 4 - missing import after a file split
// jwt was used in user.js but never require()'d after moving
// authenticateToken into its own file - would crash on first
// /profile request.
// LESSON: when splitting files, re-check every dependency each
// piece actually needs.

// BUG 5 (flagged, not fixed - Express solves it later)
// "/user/" route used .startsWith("/user/"), which ALSO matched
// "/user/123/posts" - nested paths weren't cleanly separated.
// LESSON: this exact pain is why Express's proper :param routing
// exists.

// BUG 6 - route order swallowed specific routes
// app.get("/:name", ...) was placed BEFORE /about, /home, /services,
// /contact. Express matches top-to-bottom and stops at the first
// match, so the catch-all ate every specific route.
// LESSON: specific routes must always be registered before dynamic/
// catch-all routes.


/* =====================================================================
   First CSR split (copy-paste heavy attempt)
===================================================================== */

// BUG 7 - broken require path
// require("controller/UserController") - missing "./", so Node
// tried to resolve it as an installed package, not a local file.

// BUG 8 - broken require path
// require("..repository/UserRepo") - missing "/" between ".." and
// the folder name.
// LESSON (7+8): "./" = same folder, "../" = one up, always followed
// by "/" before the next segment.


/* =====================================================================
   Rebuilt-from-memory auth (the version that revealed real gaps)
===================================================================== */

// BUG 9 - logic copied into the wrong route
// The duplicate-email check (409) was written inside /login instead
// of /signup, and the real `user` lookup was deleted entirely -
// this threw ReferenceError: user is not defined and crashed every
// login attempt.
// LESSON: when rebuilding from memory, re-verify each block landed
// in the route it actually belongs to.

// BUG 10 - wrong status codes on failure
// Both /login failure branches originally returned the default 200
// status instead of 401 - a failed login claiming HTTP success.

// BUG 11 - information leak via different error messages
// Failure branches originally said "No User Found With Email" vs
// "error not match" - two different messages leaking WHICH part
// failed.
// LESSON (10+11): auth failures must be same status code AND same
// generic message, always - directly from Video 8's own guidance.


/* =====================================================================
   Tasks resource
===================================================================== */

// BUG 12 - security bug: identity taken from client-controlled data
//   const userID = req.body.userID;   // WRONG - client can fake this
// Fixed to:
//   const userID = req.user.id;       // server-verified from JWT
// LESSON (general rule): never trust req.body for "who is this,"
// only for "what do they want to do." Identity always comes from
// the verified token/session, never from data the client typed.

// BUG 13 - createTask had zero validation
// Empty/missing `title` would silently create a task titled
// "undefined". Fixed by adding a Zod schema (title: min(1)).

// BUG 14 - updateTask didn't inherit that validation
// Even after createTask was fixed, updateTask still read
// req.body.title raw with no check - a task's title could be wiped
// with an empty PATCH body.
// LESSON (13+14): adding validation to one route does NOT mean a
// similar route automatically has it - each write path needs its
// own explicit check.

// BUG 15 - dead/unused import
//   const { success } = require("zod");   // never used in this file
// Leftover from copy-paste, meaningless destructure.
// LESSON: scan imports before calling something "done" - unused
// ones are confusing for future-you.

// BUG 16 - casing/naming mismatches, repeated ~3 times
// e.g. getTask vs gettask, req.task vs req.user, a function
// accidentally calling itself. Not a knowledge gap - a carefulness
// gap.
// LESSON: a "TypeError: X is not a function" is almost always a
// spelling mismatch between the definition and the call site -
// check both, exactly, character by character.

// BUG 17 - string vs number comparison (the best catch this session)
//   tasks.find((t) => t.id === id)
// id from req.params is ALWAYS a string ("1"); task.id is a number
// (1). === checks type AND value, so 1 === "1" is false - lookups
// silently never matched.
// LESSON (general rule): any value from req.params is always a
// string - convert it (Number(id)) before comparing to a number
// stored in your data.

// BUG 18 - separate 404/403 leaked ownership info
// Originally used 404 for "doesn't exist" and 403 for "exists but
// isn't yours" - this lets an attacker distinguish valid-but-
// forbidden IDs from nonexistent ones just from the status code.
// Fixed by merging both into a single generic 404.
// LESSON (general REST security principle): identical failure
// responses for different failure reasons, whenever the difference
// itself is sensitive information - same idea as the generic-
// login-error rule.

// BUG 19 - timing-attack vulnerability in login
// Original login returned early on `if (!user)` BEFORE ever calling
// bcrypt.compare() - meaning nonexistent emails responded measurably
// faster than wrong-password attempts, letting an attacker learn
// which emails exist just by timing responses.
// Fixed by always running bcrypt.compare() (against a dummy hash if
// no user exists), so both failure paths take the same time.
// VERIFIED, not just assumed: measured real response times across
// both cases and confirmed they clustered in the same range.

// BUG 20 - 204 response sent an unnecessary body
//   res.status(204).json({});
// 204 No Content means literally no body should be sent.
// Fixed to: res.status(204).send();


/* =====================================================================
   4. THE REAL CONCEPTUAL GAP (not a mistake - a missing piece)
   ---------------------------------------------------------------
   Couldn't initially see how middleware, controller, and service
   connect without directly calling each other.

   THE ANSWER: req is the only connector.
     1. Middleware verifies the JWT and writes req.user
     2. Express passes that SAME req object into the controller
     3. The controller reads req.user.id and hands it to the
        service as a plain argument
     4. The service NEVER sees req at all - no HTTP awareness

   This is the actual architectural point of Controller-Service-
   Repository: controllers touch HTTP, nothing below them does.
===================================================================== */


/* =====================================================================
   5. WHAT TO CARRY FORWARD INTO STEP 5
   ---------------------------------------------------------------
   - The repository layer is what makes swapping to a real database
     easy. Everything above it (controller, service, routes, JWT,
     Zod) never touched the raw arrays directly - only the
     repository did. Step 5 should only require changing
     userRepository.js / taskRepository.js.
   - Ownership checks + generic errors are a REPEATING pattern:
     404-for-both-not-found-and-not-yours, and identical messages
     for user-not-found vs wrong-password, are the same underlying
     principle applied twice - don't leak WHY something failed.
   - In-memory data does not survive a restart, but stateless JWTs
     do - proven directly by testing it, not just told.
===================================================================== */