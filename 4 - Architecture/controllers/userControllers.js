const { z } = require("zod");
const UserService = require("../services/userService");

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
  const outcome = await UserService.signup(email, password);
  if (outcome.success === false) {
    res.status(409).send(outcome.error);
  } else {
    res.send(`SignUp Successful With Email: ${outcome.email}`);
  }
}

async function login(req, res) {
  console.log("[controller] login hit, body:", req.body);
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error.issues);
  }
  const { email, password } = result.data;
  const outcome = await UserService.login(email, password);
  if (outcome.success === false) {
    res.status(401).send(outcome.error);
  } else {
    res.send(`Login Successful With Token ${outcome.token}`);
  }
}

module.exports = { signup, login };
