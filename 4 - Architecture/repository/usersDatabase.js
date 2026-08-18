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

module.exports = { findByEmail, create };
