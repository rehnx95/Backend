let tasks = [];

function create(task) {
  tasks.push(task);
}

function getTask(userID) {
  return tasks.filter((t) => t.userID === userID);
}

function getoneTask(id) {
  return tasks.find((t) => t.id === Number(id));
}
function updateTask(id, newtitle) {
  const task = tasks.find((t) => t.id === Number(id));
  task.title = newtitle;
}
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== Number(id));
}
function count() {
  return tasks.length;
}

function _reset() {
  tasks = [];
}

module.exports = { create, getTask, getoneTask, count, deleteTask, updateTask, _reset };
