const taskRepository = require("../repository/tasksDatabase");

async function createTask(userID, title) {
  let newtask = {
    userID: userID,
    title: title,
  };
  const result = await taskRepository.create(newtask);
  return { success: true, task: result };
}

async function getTask(userID, page = 1, limit = 10) {
  const allTasks = await taskRepository.getTask(userID);
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

async function getoneTask(id) {
  const task = await taskRepository.getoneTask(id);
  return { success: true, task: task };
}

async function updateTask(id, title) {
  const result = await taskRepository.updateTask(id, title);
  return { success: true, task: await taskRepository.getoneTask(id) };
}

async function deleteTask(id) {
  await taskRepository.deleteTask(id);
  return { success: true };
}
module.exports = { createTask, getTask, getoneTask, updateTask, deleteTask };
