const { z } = require("zod");
const userService = require("../services/userService");

const signupSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
});

async function signup(req, res) {
  console.log("[controller] signup hit, body:", req.body);
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error.issues);
  }
  const { email, password } = result.data;
  const outcome = await userService.signup(email, password);

  if (outcome.error === "conflict") {
    return res.status(409).send("Email already registered");
  }
  res.send(`User created: ${outcome.email}`);
}

async function login(req, res) {
  console.log("[controller] login hit, body:", req.body);
  const { email, password } = req.body;
  const outcome = await userService.login(email, password);

  if (outcome.error === "unauthorized") {
    return res.status(401).send("Invalid email or password");
  }
  res.send(outcome.token);
}

module.exports = { signup, login };
