require("dotenv").config();
const express = require("express");
const userController = require("./controllers/userControllers");
const taskController = require("./controllers/taskController");
const authenticateToken = require("./middleware/authenticateToken");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 7000;

app.get("/", (req, res) => {
  res.send("Welcome To My WebPage");
});

app.get("/profile", authenticateToken, (req, res) => {
  res.send(`Welcome ${req.user.email}, your id is ${req.user.id}`);
});

app.post("/signup", userController.signup);
app.post("/login", userController.login);
app.post("/tasks", authenticateToken, taskController.createTask);
app.get("/tasks", authenticateToken, taskController.getTask);
app.get("/tasks/:id", authenticateToken, taskController.getoneTask);
app.patch("/tasks/:id", authenticateToken, taskController.updateTask);
app.delete("/tasks/:id", authenticateToken, taskController.deleteTask);

app.listen(port, () => {
  console.log(`server running ${port}`);
});
