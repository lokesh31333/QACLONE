const express = require("express");
const {
  getQuestions,
  viewQuestion,
  editQuestion,
  postQuestion,
  deleteQuestion,
  voteQuestion,
} = require("../controllers/questionController");
const authChecker = require("../utils/authChecker");

const questionRouter = express.Router();
questionRouter.post("/new", authChecker, postQuestion);
questionRouter.put("/update", authChecker, editQuestion);
questionRouter.put("/vote", authChecker, voteQuestion);
questionRouter.get("/", getQuestions);
questionRouter.get("/get", authChecker, viewQuestion);
questionRouter.delete("/:quesId", authChecker, deleteQuestion);
module.exports = {
  questionRouter,
};
