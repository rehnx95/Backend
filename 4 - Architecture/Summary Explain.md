# Step 4 — Core Backend Architecture — Explain-It-Out-Loud Guide

Same format again. Topics 31-34 are concepts, 35-37 are "go build it" — for those I'll explain what "done" looks like and point at how Depot already does (or doesn't) do it, since it's the most useful reference you've got.

---

### 31. Authentication and Authorization

**Simple explanation:** These are two different questions, and mixing them up is one of the most common backend mistakes.

- **Authentication ("who are you?")** — proving identity. Login, verifying a password, issuing/checking a token.
- **Authorization ("what are you allowed to do?")** — once we know who you are, deciding if you're allowed to do *this specific thing*.

Your codebase separates these cleanly into two middleware:

```js
// authentication — "is there a valid token, and does that user still exist?"
authenticateToken(req, res, next) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await userRepository.getUser(decoded.id);
  req.user = user; // identity established
  next();
}

// authorization — "is this identity allowed to do THIS action?"
authenticateRole("admin")  // role-based: is req.user.role === "admin"?
```

But role-based authorization alone isn't enough — most of your services also do **resource-level authorization**: not just "are you an admin," but "do *you specifically* own *this* project." That's the `getMembership` check repeated across `taskService.js`, `projectService.js`, `commentService.js` — verifying the requester is actually tied to the resource they're trying to touch, not just logged in.

Say it like this: *"Authentication answers 'who is this.' Authorization answers 'can this specific person do this specific thing to this specific resource' — and it's not enough to check just the role; you often need to check ownership of the actual resource too."*

---

### 32. Validations and Transformations

**Simple explanation:**
- **Validation** — checking that incoming data is *shaped correctly* before you trust it (right types, required fields present, string lengths, valid enum values). Reject bad data early, with a clear error, before it ever touches business logic or the database.
- **Transformation** — converting validated data into the *shape your code actually wants* (string → number, string → lowercase email, ISO string → Date, trimming whitespace).

Your `zod` schemas do both at once:

```js
const signup_schema = z.object({
  email: z.email("Please enter a valid email address").toLowerCase(), // validates AND transforms
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const result = signup_schema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ success: false, error: result.error.issues.map(i => i.message) });
}
const { email, password } = result.data; // validated + transformed — safe to use
```

**Why it matters — and this is a mistake pattern your own `mistakes.js` calls out repeatedly:** `safeParse()` always returns a truthy object. The bug isn't "did parsing happen" — it's "did you check `.success` and then actually use `.data` instead of the raw `req.body`."

Say it like this: *"Validation rejects bad shapes before they reach your logic. Transformation reshapes good data into what you actually need. Zod does both in the same schema — but you have to check `.success` explicitly and use `.data`, not the raw body, or the validation was pointless."*

---

### 33. Controllers, Services, Repositories

**Simple explanation:** A layering pattern that separates *why* code exists into three concerns, so each layer only has one job.

| Layer | Job | Talks to |
|---|---|---|
| **Controller** | Parse/validate the HTTP request, shape the HTTP response | Services only — never touches the DB |
| **Service** | Business rules, authorization, orchestration | Repositories only — never touches `req`/`res` |
| **Repository** | Raw data access (SQL queries) | The database only — no business logic |

This is exactly your project's structure — `controllers/taskControllers.js` → `services/taskService.js` → `repository/tasksDatabase.js`.

**Why it matters:** Each layer can be understood, tested, and changed independently. If you swap Postgres for MongoDB, only repositories change. If validation rules change, only controllers change. If an authorization rule changes ("now managers can also delete tasks"), only services change. Without this separation, all three concerns tangle together and one change risks breaking unrelated things.

Say it like this: *"Controllers handle HTTP in and out. Services hold the business rules and decide what's allowed. Repositories are the only layer that knows SQL exists. Each layer only calls the one below it — a controller never queries the database directly, and a repository never knows what an HTTP status code is."*

---

### 34. Complete REST API Design

**Simple explanation:** REST is a set of conventions for making an API predictable, not a strict spec. The core ideas:

- **Resources are nouns, not verbs** — `/tasks`, not `/getTasks`
- **HTTP methods carry the verb** — `GET` (read), `POST` (create), `PATCH`/`PUT` (update), `DELETE` (remove)
- **Status codes mean something specific** — `200` OK, `201` Created, `204` No Content (success, empty body), `400` bad input, `401` not authenticated, `403` authenticated but not allowed, `404` not found, `409` conflict (e.g. duplicate email), `500` server error
- **Nesting reflects ownership** — `/projects/:project_id/tasks` (tasks *belong to* a project) vs. flat `/tasks/:task_id` (once you have the ID, you don't need the parent in the URL)
- **Idempotency** — calling `DELETE` or `PUT` on the same resource twice should have the same end result as calling it once; `POST` is the one method that's expected to *not* be idempotent (each call creates something new)

Your API mostly follows this well — e.g. `app.js` correctly registers literal routes (`/users/profile`) *before* param routes (`/users/:target_id`), because Express matches routes top-to-bottom and a param route would otherwise swallow the literal one.

Say it like this: *"Resources are nouns, the HTTP verb carries the action, and the status code tells the client *why* — not just pass/fail. Route order matters too: literal paths have to come before dynamic `:param` routes, or the param route greedily matches first."*

---

## 4.1 — Apply It

### 35. Rebuild an Express App in Controller-Service-Repository Layers

**What "done" looks like:** Pick one resource end-to-end and enforce the rule strictly: the controller *only* imports the service, the service *only* imports the repository, and nothing skips a layer.

A good self-check, using your own `taskService.js` as the template:

```js
// controller — no SQL, no business rules, just parse + delegate + respond
async function createTask(req, res) {
  const result = task_schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({...});
  const outcome = await taskService.createTask(req.user.id, ...result.data);
  if (!outcome.success) return handleServiceError(res, outcome.error);
  res.status(201).json({ success: true, value: outcome.value });
}

// service — no req/res, no SQL, just rules
async function createTask(user_id, project_id, title, priority, due_date) {
  const membership = await projectMembersDatabase.getMembership(project_id, user_id);
  if (!membership) return { success: false, error: "Forbidden Not Member Of That Project" };
  const result = await tasksDatabase.createTask({ user_id, project_id, title, priority, due_date });
  return { success: true, value: result };
}

// repository — no business rules, just the query
async function createTask(new_task) {
  const result = await pool.query("INSERT INTO tasks (...) VALUES (...) RETURNING *", [...]);
  return result.rows[0];
}
```

The exercise worth doing: go through *every* controller in Depot and check none of them import `pool`/`db` directly, and every service returns the same consistent `{ success, value | error }` shape (this is already category #18 in your own `mistakes.js` — "inconsistent not-found signaling").

---

### 36. Add Zod or Joi for Validation

**What "done" looks like:** Every route that accepts a body has a schema, `safeParse` is checked before `.data` is used, and error messages are actually returned to the client (not swallowed).

Zod vs Joi, briefly — you're already using Zod, and for good reason:

| | Zod | Joi |
|---|---|---|
| TypeScript inference | Built-in — `z.infer<typeof schema>` gives you a type for free | Needs separate type annotations |
| API style | Chainable, TS-first | Chainable, framework-agnostic, older/more established |
| Bundle | Smaller | Larger |

**TS type inference bonus (optional, ties into #37):** If you ever move to TypeScript, this is the payoff —

```ts
const task_schema = z.object({
  title: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
});
type TaskInput = z.infer<typeof task_schema>; // { title: string; priority: "low"|"medium"|"high" }
```

No manually-maintained interface that can drift from the actual validation — the type *is* the schema.

---

### 37. Implement JWT Auth by Hand Once, Then Use a Library

**What "done" looks like:** Understand what `jsonwebtoken` is doing under the hood, so using the library afterward isn't a black box.

A JWT is just three base64url-encoded pieces joined by dots: `header.payload.signature`. The header and payload are plain JSON (**not encrypted — just encoded**, anyone can decode and read them, which is exactly what your own `frontend/js/api.js` `decodeToken()` does client-side). The signature is what actually can't be forged without the secret.

Minimal hand-rolled version, to understand the shape before trusting the library:

```js
const crypto = require("crypto");

function base64url(input) {
  return Buffer.from(JSON.stringify(input)).toString("base64url");
}

function signToken(payload, secret) {
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const body = base64url(payload);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token, secret) {
  const [header, body, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  if (signature !== expected) throw new Error("Invalid signature");
  return JSON.parse(Buffer.from(body, "base64url"));
}
```

Then compare that to what `jsonwebtoken` gives you for free: expiry (`exp`) checking, multiple algorithms, and protection against timing attacks in the signature comparison (`crypto.timingSafeEqual`-style constant-time checks — the same principle your `siteOwner.js` middleware already uses deliberately for the `/testing` secret key).

Say it like this: *"A JWT isn't encrypted, it's signed — anyone can read the payload, but only the server holding the secret can produce a valid signature for it. `jsonwebtoken` handles expiry, algorithm negotiation, and safe comparison so you don't have to get those details right yourself every time."*

---

## Quick recall drill

31. **AuthN vs AuthZ** — "who are you" vs. "are you allowed to do *this*" — and authorization often needs resource-level checks, not just role checks
32. **Validation vs transformation** — reject bad shapes / reshape good data into what you need; must check `.success` and use `.data`
33. **Controller → Service → Repository** — HTTP shaping → business rules → raw data access, each layer only calls the one below it
34. **REST** — nouns for resources, verbs via HTTP methods, status codes carry meaning, literal routes before param routes
35. **Layered rebuild** — no layer-skipping, consistent `{ success, value|error }` shape everywhere
36. **Zod/Joi** — Zod's edge is built-in TS type inference from the same schema you validate with
37. **JWT** — signed, not encrypted; header.payload.signature; library adds expiry + safe comparison you'd otherwise have to implement yourself