const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

async function signup(email, password) {
  console.log("[service] signup called for:", email);
  const existing = userRepository.findByEmail(email);
  if (existing) {
    return { error: "conflict", message: "Email already registered" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: userRepository.count() + 1,
    email,
    password: hashedPassword,
  };
  userRepository.create(newUser);
  return { success: true, email: newUser.email };
}

async function login(email, password) {
  console.log("[service] login called for:", email);
  const user = userRepository.findByEmail(email);
  if (!user) {
    return { error: "unauthorized" };
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { error: "unauthorized" };
  }
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
  return { success: true, token };
}

module.exports = { signup, login };
