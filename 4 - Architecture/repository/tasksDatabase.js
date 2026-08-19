const pool = require("../db");

async function getoneTask(id) {
  const result = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
  return result.rows[0];
}

async function deleteTask(id) {
  const result = await pool.query("DELETE FROM tasks WHERE id=$1 returning *", [
    id,
  ]);
  return result.rows[0];
}

async function getTask(userID) {
  const result = await pool.query("SELECT * FROM tasks WHERE user_id=$1", [
    userID,
  ]);
  return result.rows;
}

async function create(task) {
  const result = await pool.query(
    "INSERT INTO tasks (user_id,title) VALUES ($1,$2) RETURNING *",
    [task.userID, task.title],
  );
  return result.rows[0];
}

async function updateTask(id, newtitle) {
  const result = await pool.query(
    "UPDATE tasks SET title=$1 WHERE id=$2 RETURNING *",
    [newtitle, id],
  );
  return result.rows[0];
}
module.exports = { getoneTask, deleteTask, getTask, create, updateTask };
