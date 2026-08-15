let users = [];

function findByEmail(email) {
  console.log("[repository] findByEmail:", email);
  return users.find((u) => u.email === email);
}
function create(user) {
  console.log("[repository] create:", user.email);
  users.push(user);
}
function count() {
  return users.length;
}
module.exports = { findByEmail, create, count };


// const pool = require("../config/db");

// async function findByEmail(email) {
//   console.log("[repository] SQL findByEmail:", email);
  
//   // Use parameterized queries ($1) to protect against SQL Injection security threats
//   const query = "SELECT * FROM users WHERE email = $1";
//   const result = await pool.query(query, [email]);
  
//   // return the actual user row, or undefined if no user was found
//   return result.rows[0]; 
// }

// async function create(user) {
//   console.log("[repository] SQL create:", user.email);
  
//   const query = "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *";
//   const values = [user.email, user.password];
  
//   const result = await pool.query(query, values);
//   return result.rows[0];
// }

// module.exports = { findByEmail, create };
