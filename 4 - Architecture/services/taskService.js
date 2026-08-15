const taskRepository = require("../repository/taskRepository");

function createTask(userID, title) {
  let newtask = {
    id: taskRepository.count() + 1,
    userID: userID,
    title: title,
    completed: false,
    createdAt: new Date(),
  };
  taskRepository.create(newtask);
  return { success: true, task: newtask };
}

function getTask(userID) {
  const task = taskRepository.gettask(userID);
  return { success: true, task: task };
}

function getoneTask(id) {
  const task = taskRepository.getonetask(id);
  return { success: true, task: task };
}

module.exports = { createTask, getTask, getoneTask };
