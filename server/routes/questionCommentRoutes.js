const express = require("express");
const {
  addQuesComment,
  deleteQuesComment,
  editQuesComment,
} = require("../controllers/questionCommentController");

const questionCommentRouter = express.Router();
questionCommentRouter.post("/new", addQuesComment);
questionCommentRouter.put("/update", editQuesComment);
questionCommentRouter.delete("/", deleteQuesComment);

module.exports = {
  questionCommentRouter,
};
