const pool = require("../db");

async function findByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);
  return result.rows[0];
}

async function create(user) {
  const result = await pool.query(
    "INSERT INTO users (email,password) VALUES ($1,$2) RETURNING *",
    [user.email, user.password],
  );
  return result.rows[0];
}

async function getall() {
  const result = await pool.query("SELECT id,email FROM users");
  return result.rows;
}

async function deleteUser(email) {
  const result = await pool.query(
    "DELETE FROM users WHERE email=$1 returning *",
    [email],
  );
  return result.rows[0];
}

async function updateUser(id, email) {
  const result = await pool.query(
    "UPDATE users SET email=$1 WHERE id=$2 RETURNING *",
    [email, id],
  );
  return result.rows[0];
}

async function getUser(id) {
  const result = await pool.query("SELECT id,email FROM users WHERE id=$1", [
    id,
  ]);
  return result.rows[0];
}

module.exports = {
  findByEmail,
  create,
  getall,
  deleteUser,
  getUser,
  updateUser,
};
