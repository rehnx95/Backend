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

function getTask(userID, page = 1, limit = 10) {
  const allTasks = taskRepository.getTask(userID);
  const total = allTasks.length;
  const totalPages = Math.ceil(total / limit);

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedTasks = allTasks.slice(start, end);

  return {
    success: true,
    data: paginatedTasks,
    total,
    page,
    totalPages,
  };
}

function getoneTask(id) {
  const task = taskRepository.getoneTask(id);
  return { success: true, task: task };
}

function updateTask(id, title) {
  taskRepository.updateTask(id, title);
  return { success: true, task: taskRepository.getoneTask(id) };
}

function deleteTask(id) {
  taskRepository.deleteTask(id);
  return { success: true };
}
module.exports = { createTask, getTask, getoneTask,updateTask,deleteTask };
