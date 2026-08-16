const taskService = require("../services/taskService");
const { z } = require("zod");

// req.user.id is unique identification of user extracted from login and pass to authenticate funtion that return req.user as decoded

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

function createTask(req, res) {
  const result = taskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error.issues);
  }

  const userID = req.user.id;
  const { title } = result.data;

  const outcome = taskService.createTask(userID, title);
  res.status(201).send(`Task Created With Title ${outcome.task.title}`);
}

function getTask(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const outcome = taskService.getTask(req.user.id, page, limit);

  res.status(200).json({
    data: outcome.data,
    total: outcome.total,
    page: outcome.page,
    totalPages: outcome.totalPages,
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

function updateTask(req, res) {
  const result = taskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error.issues);
  }
  const { title } = result.data;
  const id = req.params.id;
  const outcome = taskService.getoneTask(id);
  const task = outcome.task;
  if (!task || task.userID !== req.user.id) {
    return res.status(404).send("Task not found");
  }
  const updatedtask = taskService.updateTask(id, title);
  res.status(200).json(updatedtask.task);
}

function deleteTask(req, res) {
  const id = req.params.id;
  const outcome = taskService.getoneTask(id);
  const task = outcome.task;
  if (!task || task.userID !== req.user.id) {
    return res.status(404).send("Task not found");
  }
  taskService.deleteTask(id);
  res.status(204).send();
}

module.exports = { createTask, getTask, getoneTask, deleteTask, updateTask };
