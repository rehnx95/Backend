let tasks = [];

function create(task) {
  tasks.push(task);
}

function gettask(userID) {
  return tasks.filter((t) => t.userID === userID);
}

function getonetask(id) {
  return tasks.find((t) => t.id === Number(id));
}

function count() {
  return tasks.length;
}

module.exports = { create, gettask, getonetask, count };
