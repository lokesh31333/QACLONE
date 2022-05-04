const express = require("express");
const { getUser, getAllUsers } = require("../controllers/userController");

const userRouter = express.Router();
userRouter.get("/all", getAllUsers);
userRouter.get("/:username", getUser);

module.exports = {
  userRouter,
};
