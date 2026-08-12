require("dotenv").config();
const express = require("express");
const userController = require("./controllers/userController");
const authenticateToken = require("./middleware/authenticateToken");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 7000;

app.get("/profile", authenticateToken, (req, res) => {
  res.send(`Welcome ${req.user.email}, your id is ${req.user.id}`);
});

app.post("/signup", userController.signup);
app.post("/login", userController.login);

app.listen(port, () => {
  console.log(`server running ${port}`);
});