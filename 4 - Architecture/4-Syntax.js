/*
=====================================================================
 STEP 4 — CORE BACKEND ARCHITECTURE — SYNTAX ONLY
 Items 31-37: Auth, Validation (Zod), Controller/Service/Repository,
 JWT-by-hand
=====================================================================
*/

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");


// ============================================================
// 31 / 37 — AUTH: bcrypt + JWT syntax
// ============================================================

// --- bcrypt ---
const hashedPassword = await bcrypt.hash("plaintext", 10); // hash + salt rounds
const isMatch = await bcrypt.compare("plaintext", hashedPassword); // check match

// --- jsonwebtoken ---
const token = jwt.sign(
  { id: 1, email: "a@a.com" },     // payload
  process.env.JWT_SECRET,          // secret key
  { expiresIn: "1h" }              // options
);

const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid/expired

// --- auth middleware pattern ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("No token provided");
  }
  const token = authHeader.split(" ")[1]; // "Bearer <token>" -> token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send("invalid token");
  }
}

// usage on a protected route:
// app.get("/profile", authenticateToken, (req, res) => {
//   res.send(`Welcome ${req.user.email}, your id is ${req.user.id}`);
// });


// ============================================================
// 32 / 36 — VALIDATION: Zod syntax
// ============================================================

// --- basic types ---
z.string();
z.number();
z.boolean();
z.date();
z.array(z.string());
z.object({ key: z.string() });

// --- string validations ---
z.string().email();
z.string().min(6);
z.string().max(100);
z.string().length(10);
z.string().url();
z.string().uuid();
z.string().regex(/^[0-9]+$/);
z.string().startsWith("prefix");
z.string().endsWith("suffix");
z.string().trim();          // transform
z.string().toLowerCase();   // transform
z.string().toUpperCase();   // transform

// --- number validations ---
z.number().min(0);
z.number().max(120);
z.number().int();
z.number().positive();
z.number().nonnegative();

// --- optional / default / nullable ---
z.string().optional();
z.string().nullable();
z.string().default("fallback value");

// --- objects, including nested ---
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().optional(),
});

const orgSchema = z.object({
  name: z.string(),
  owner: z.object({
    email: z.string().email(),
  }),
});

// --- arrays ---
z.array(z.string());
z.array(z.string()).min(1);
z.array(z.object({ id: z.number() }));

// --- .parse() — throws if invalid ---
try {
  const data = userSchema.parse({});
} catch (err) {
  console.log(err.issues);
}

// --- .safeParse() — never throws, returns a result object ---
const result = userSchema.safeParse({});
if (!result.success) {
  console.log(result.error.issues); // array of validation errors
} else {
  console.log(result.data); // validated (and transformed) data
}

// --- cross-field / conditional validation (.refine) ---
const signupSchema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const profileSchema = z.object({
  married: z.boolean(),
  partner: z.string().optional(),
}).refine((data) => !data.married || !!data.partner, {
  message: "Partner name is required when married is true",
  path: ["partner"],
});

// --- transformation (.transform) ---
z.string().transform((val) => val.trim());
z.string().email().toLowerCase();            // shorthand transform
z.string().transform((val) => Number(val));  // cast string -> number

// --- using in Express ---
const exampleSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
});

async function exampleSignup(req, res) {
  const result = exampleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error.issues);
  }
  const { email, password } = result.data; // use .data, not req.body
}


// ============================================================
// 33 / 35 — CONTROLLER / SERVICE / REPOSITORY: file structure + syntax
// ============================================================

// repositories/userRepository.js
let users = [];
function findByEmail(email) {
  return users.find((u) => u.email === email);
}
function create(user) {
  users.push(user);
  return user;
}
function count() {
  return users.length;
}
module.exports = { findByEmail, create, count };


// services/userService.js
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const userRepository = require("../repositories/userRepository");

async function signup(email, password) {
  const existing = findByEmail(email);
  if (existing) {
    return { success: false, error: "Email Already Exist" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: count() + 1, email, password: hashedPassword };
  create(newUser);
  return { success: true, email: newUser.email };
}

async function login(email, password) {
  const user = findByEmail(email);
  if (!user) {
    return { success: false, error: "Unauthorize" };
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { success: false, error: "Unauthorize" };
  }
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return { success: true, token };
}

module.exports = { signup, login };


// controllers/userController.js
// const { z } = require("zod");
// const userService = require("../services/userService");

async function controllerSignup(req, res) {
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error.issues);
  }
  const { email, password } = result.data;
  const outcome = await signup(email, password);
  if (outcome.success === false) {
    return res.status(409).send(outcome.error);
  }
  res.send(`SignUp Successful With Email: ${outcome.email}`);
}

async function controllerLogin(req, res) {
  const { email, password } = req.body;
  const outcome = await login(email, password);
  if (outcome.success === false) {
    return res.status(401).send(outcome.error);
  }
  res.send(`Login Successful With Token ${outcome.token}`);
}

module.exports = { signup: controllerSignup, login: controllerLogin };


// user.js (main file — routes only)
// const userController = require("./controllers/userController");
// const authenticateToken = require("./middleware/authenticateToken");
// app.post("/signup", userController.signup);
// app.post("/login", userController.login);
// app.get("/profile", authenticateToken, (req, res) => { ... });


// ============================================================
// 34 — REST API DESIGN: route/status-code syntax per operation
// ============================================================

// CREATE
// app.post("/organizations", (req, res) => {
//   res.status(201).send(newObject);
// });

// LIST (with pagination/sort/filter query params)
// app.get("/organizations", (req, res) => {
//   const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", status } = req.query;
//   res.status(200).send({ data, total, page, totalPages });
// });

// GET SINGLE
// app.get("/organizations/:id", (req, res) => {
//   if (!found) return res.status(404).send("Not found");
//   res.status(200).send(found);
// });

// UPDATE
// app.patch("/organizations/:id", (req, res) => {
//   res.status(200).send(updatedObject);
// });

// DELETE
// app.delete("/organizations/:id", (req, res) => {
//   res.status(204).send();
// });

// CUSTOM ACTION
// app.post("/organizations/:id/archive", (req, res) => {
//   res.status(200).send(archivedObject); // or 201 if something new was created
// });