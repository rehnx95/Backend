const { z } = require("zod");
const UserService = require("../services/userService2");

const signupSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
});

async function deleteUser(req, res) {
  const email = req.user.email;
  const id = req.user.id;
  await UserService.deleteUser(email);
  res.json({
    success: true,
    id,
    email,
  });
}

async function getUser(req, res) {
  const requested_id = req.params.id;
  // if (requested_id !== req.user.id) {
  //   return res.status(404).json({ success: false, value: "User Not Exist" });
  // }
  const user = await UserService.getUser(requested_id);
  if (user.success === false) {
    return res.json({ success: false, error: user.error });
  }
  res.json({ success: true, user: user.value });
}

async function updateUser(req, res) {
  const requested_id = req.params.id;
  if (Number(requested_id) !== req.user.id) {
    return res.status(403).json({ success: false, value: "Forbidden" });
  }
  const user = await UserService.updateUser(requested_id, req.body.email);
  if (user.success === false) {
    return res.json({ success: false, error: user.error });
  }
  res.json({ success: true, updatedUser: user.value });
}

async function getall(req, res) {
  const trusteduser = req.user.email;
  const trusteduser_id = req.user.id;
  const users = await UserService.getall();
  res.json({
    success: true,
    value: users.value,
    trusteduser,
    trusteduser_id,
  });
}

async function signup(req, res) {
  console.log("[controller] signup hit, body:", req.body);
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { email, password } = result.data;
  const outcome = await UserService.signup(email, password);
  if (outcome.success === false) {
    res.status(409).json({ success: false, error: outcome.error });
  } else {
    res.json({
      success: true,
      value: `SignUp Successful With Email: ${outcome.value}`,
    });
  }
}

async function login(req, res) {
  console.log("[controller] login hit, body:", req.body);
  const result = signupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { email, password } = result.data;
  const outcome = await UserService.login(email, password);
  if (outcome.success === false) {
    return res.status(401).json({ success: false, error: outcome.error });
  } else {
    res.json({
      success: true,
      value: `Login Successful With Token ${outcome.value}`,
    });
  }
}

module.exports = { signup, login, getall, deleteUser, getUser, updateUser };
