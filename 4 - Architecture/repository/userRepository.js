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

