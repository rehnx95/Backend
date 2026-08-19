const taskService = require("../services/taskService2");
const { z, success } = require("zod");

// req.user.id is unique identification of user extracted from login and pass to authenticate funtion that return req.user as decoded

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

async function createTask(req, res) {
  const result = taskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }

  const userID = req.user.id;
  const { title } = result.data;

  const outcome = await taskService.createTask(userID, title);
  res.status(201).json({
    success: true,
    value: `Task Created With Title ${outcome.value.title}`,
  });
}

async function getTask(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const outcome = await taskService.getTask(req.user.id, page, limit);

  res.status(200).json({
    success:true,
    value: outcome.value,
    total: outcome.total,
    page: outcome.page,
    totalPages: outcome.totalPages,
  });
}

async function getoneTask(req, res) {
  const outcome = await taskService.getoneTask(req.params.id);
  const task = outcome.value;

  if (!task || task.user_id !== req.user.id) {
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  res.status(200).json({ success: true, value: task });
}

async function updateTask(req, res) {
  const result = taskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.issues });
  }
  const { title } = result.data;
  const id = req.params.id;
  const outcome = await taskService.getoneTask(id);
  const task = outcome.value;
  if (!task || task.user_id !== req.user.id) {
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  const updatedtask = await taskService.updateTask(id, title);
  res.status(200).json({ success: true, value: updatedtask.value });
}

async function deleteTask(req, res) {
  const id = req.params.id;
  const outcome = await taskService.getoneTask(id);
  const task = outcome.value;
  if (!task || task.user_id !== req.user.id) {
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  await taskService.deleteTask(id);
  res.status(204).send();
}

module.exports = { createTask, getTask, getoneTask, deleteTask, updateTask };