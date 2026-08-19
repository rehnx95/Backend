const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repository/usersDatabase");

async function getUser(id) {
  const user = await userRepository.getUser(id);
  if (!user) {
    return { success: false, error: "User Not Exist" };
  }
  return { success: true, value: user };
}

async function updateUser(id, email) {
  const updatedUser = await userRepository.updateUser(id, email);

  if (!updatedUser) {
    return { success: false, error: "User Not Exist" };
  }
  return { success: true, value: updatedUser };
}

async function deleteUser(email) {
  await userRepository.deleteUser(email);
  return { success: true };
}

async function getall() {
  const result = await userRepository.getall();
  return { success: true, value: result };
}

async function signup(email, password) {
  console.log("[service] signup called for:", email);
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    return { success: false, error: "Email Already Exist" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    email,
    password: hashedPassword,
  };
  const result = await userRepository.create(newUser);
  return { success: true, value: result.email };
}

async function login(email, password) {
  console.log("[service] login called for:", email);
  const user = await userRepository.findByEmail(email);
  const hashToCompare = user
    ? user.password
    : "$2b$10$invalidsaltinvalidsaltinvalidsa";
  const isMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !isMatch) {
    return { success: false, error: "Unauthorize" };
  }
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
  return { success: true, value: token };
}

module.exports = { signup, login, getall, deleteUser, getUser, updateUser };
