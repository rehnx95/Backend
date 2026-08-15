const taskService = require("../services/taskService");

function createTask(req, res) {
  const userID = req.user.id;
  const title = req.body.title;
  const outcome = taskService.createTask(userID, title);
  res.send(`Task Created With Title ${outcome.task.title}`);
}

function getTask(req, res) {
  const outcome = taskService.getTask(req.user.id);
  res.status(200).json({
    data: outcome.task,
    total: outcome.task.length,
    page: 1,
    totalPages: 1,
  });
}

function getoneTask(req, res) {
  const outcome = taskService.getoneTask(req.params.id);
  const task = outcome.task;

  if (!task || task.userID !== req.user.id) {
    return res.status(404).send("Task not found");
  }
  res.status(200).json(task);
}

module.exports = { createTask, getTask, getoneTask };
