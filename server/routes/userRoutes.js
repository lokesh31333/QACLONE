const express = require("express");
const { getUser, getAllUsers , insertbookmark } = require("../controllers/userController");


const userRouter = express.Router();
userRouter.get("/all", getAllUsers);
userRouter.get("/:username", getUser);
userRouter.post("/bookmarks", insertbookmark);
module.exports = {
  userRouter,
};
