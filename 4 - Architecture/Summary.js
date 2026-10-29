/*
=====================================================================
 BACKEND BUILD LOG — GENERAL SUMMARY
 Through Roadmap Step 5.2 / Item 39
 Covers: auth system, tasks REST resource, RBAC layer, and every
 recurring mistake pattern found across multiple build attempts.
=====================================================================
*/


/* =====================================================================
   1. WHAT WAS BUILT, INDEPENDENTLY
   ---------------------------------------------------------------
   - Full controller -> service -> repository layered backend.
   - Rebuilt from memory MORE THAN ONCE, without copying earlier code.
   - Full JWT auth: signup, login, bcrypt hashing, jwt.verify
     middleware, protected routes.
   - Full CRUD REST resource (tasks): ownership checks, pagination,
     Zod validation on writes, RBAC added later.
   - Real testing throughout: automated scripts, plus at least one
     vulnerability (timing attack) fixed AND independently verified
     by measuring real response times, not just assumed fixed.

   TAKEAWAY: across every session the blocker was never "can't build
   this." The real gaps were specific, nameable, and repeat in
   predictable categories — see below.
===================================================================== */


/* =====================================================================
   2. RECURRING MISTAKE CATEGORIES (the real patterns, not one-offs)
===================================================================== */

// --- A. Status codes lying about outcome -----------------------------
// - 404 route returning 200.
// - Failed login returning 200 instead of 401.
// - Created-resource handler returning 200 instead of 201.
// - Failure branches returning 200 + { success: false } instead of 4xx.
// RULE: the HTTP status code must always match what actually happened
// — never rely on the response body alone to signal failure.

// --- B. Information leaks via inconsistent error responses -----------
// - Different error messages for "wrong password" vs "no such user"
//   (lets an attacker enumerate valid emails).
// - Different status codes (404 vs 403) for "doesn't exist" vs
//   "exists but isn't yours" (leaks which IDs are valid).
// - Timing difference: no-user path skipped bcrypt entirely, making
//   it measurably faster than a wrong-password path.
// RULE: whenever the REASON for a failure is itself sensitive,
// collapse every reason into one identical response — same status,
// same message, same rough timing. One principle, three surfaces.

// --- C. Identity and trust boundaries ---------------------------------
// - Reading userID from req.body instead of req.user.id (verified
//   JWT payload) — lets a client claim to be anyone.
// - Trusting a role claim embedded in the JWT instead of re-checking
//   the current role in the DB — a demoted admin keeps access until
//   the token expires.
// RULE: identity ("who is this") always comes from a server-verified
// source. req.body / req.params are only for "what do they want,"
// never "who are they."

// --- D. Validation gaps that don't propagate --------------------------
// - Zod added to createTask but not updateTask — a title could be
//   wiped with an empty PATCH body.
// - No validation on route params (non-numeric :id) — falls through
//   to a generic 500 instead of a clean 400.
// RULE: validation does not inherit between similar routes. Every
// write path needs its own explicit check.

// --- E. Type mismatches from request data ------------------------------
// - req.params.id is ALWAYS a string; comparing it directly to a
//   numeric id field with === silently fails (1 === "1" -> false).
// RULE: always explicitly coerce values from req.params / req.query
// before comparing them to typed values.

// --- F. File-splitting / refactor breakage ------------------------------
// - Moved authenticateToken into its own file, forgot to re-require
//   jwt in the file that still used it.
// - Broken relative import paths: "controller/X" (missing "./"),
//   "..repository/X" (missing "/" after "..").
// RULE: after any file split or move, re-verify every import in the
// new file — don't assume it "just carries over."

// --- G. Rebuild-from-memory drift ----------------------------------------
// - Duplicate-email check written inside /login instead of /signup;
//   the real `user` lookup got deleted -> ReferenceError on every
//   login attempt.
// - Variable renamed in one place but not everywhere referenced.
// RULE: when rewriting from memory or renaming something, search the
// whole file for every other usage before calling it done.

// --- H. Response / body correctness details -------------------------------
// - res.status(204).json({}) — 204 must have NO body at all.
// - Dead import: const { success } = require("zod") — never used.
// - Logging full DB rows (including password hashes) even though the
//   plaintext password was correctly redacted elsewhere.
// RULE: redaction has to be applied at every layer that logs the
// object, not just the first one.

// --- I. Small, low-cost carelessness bugs (not knowledge gaps) -------------
// - getTask vs gettask, req.task vs req.user, a function calling itself.
// RULE: "X is not a function" or a silent undefined is almost always
// a spelling/casing mismatch — check definition and call site
// character-by-character before assuming it's a logic bug.


/* =====================================================================
   3. THE CORE ARCHITECTURAL CONCEPT THAT HAD TO CLICK
   ---------------------------------------------------------------
   Question: how do middleware, controller, and service connect
   without calling each other directly?

   Answer: req is the only connector.
     1. Middleware verifies the JWT, attaches result to req.user.
     2. Express passes that SAME req into the controller.
     3. Controller reads req.user.id, passes it as a PLAIN ARGUMENT
        into the service.
     4. Service has zero HTTP awareness — no req, res, status codes,
        or headers ever appear below the controller layer.

   This is the actual point of controller -> service -> repository:
   HTTP concerns stay in the controller; nothing below it knows an
   HTTP request even exists.
===================================================================== */


/* =====================================================================
   4. CARRY FORWARD INTO LATER STEPS
   ---------------------------------------------------------------
   - The repository layer is what makes swapping storage backends
     cheap (in-memory -> real DB, or one DB lib -> another). If a
     future step needs a change outside the repository files, the
     layering leaked somewhere.
   - "Don't leak WHY something failed" keeps reappearing: generic
     404s, generic auth error messages, constant-time auth
     comparisons — all the same idea, different attack surfaces.
   - Stateless JWTs survive a server restart even when in-memory
     data doesn't — proven directly by testing, not taken on faith.
   - RBAC sits ON TOP OF auth, not in place of ownership checks — a
     route can need all three, stacked: authentication (is this user
     real), authorization (is this role allowed), ownership (does
     this user own this specific resource).
   - Status codes, error-message consistency, and logging hygiene are
     easy to get right once and easy to let drift back in during
     later edits — worth a quick self-review pass after any batch of
     changes, not just when something visibly breaks.
===================================================================== */


/* =====================================================================
   5. ROADMAP POSITION AT TIME OF WRITING
   ---------------------------------------------------------------
   Completed through Step 5.2, item 39 (raw SQL: SELECT, JOIN,
   GROUP BY, subqueries). Item 40 (indexing / EXPLAIN ANALYZE) also
   done hands-on, separately.

   Next unstarted: items 41-44 (ORM / migrations / transactions),
   then Step 6 onward (caching, queues, search, reliability,
   security, testing, deployment, system design).
===================================================================== */