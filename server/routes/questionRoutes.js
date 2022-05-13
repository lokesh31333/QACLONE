const express = require("express");
const {
  getQuestions,
  viewQuestion,
  editQuestion,
  postQuestion,
  deleteQuestion,
  voteQuestion,
  checkIfNeedAdminApproval,
  getPendingQuestions,
  approveQuestion,
} = require("../controllers/questionController");
const { getQuestionsFromCache } = require("../controllers/redisController");
const { authChecker, adminChecker } = require("../utils/authChecker");

const questionRouter = express.Router();
questionRouter.post(
  "/new",
  authChecker,
  checkIfNeedAdminApproval,
  postQuestion
);
questionRouter.put("/update", authChecker, editQuestion);
questionRouter.put("/vote", authChecker, voteQuestion);
questionRouter.get("/", getQuestionsFromCache, getQuestions);
questionRouter.get("/get", viewQuestion);
questionRouter.get("/get-pending-questions", getPendingQuestions);
questionRouter.put("/approve", authChecker, adminChecker, approveQuestion);
questionRouter.delete("/:quesId", authChecker, deleteQuestion);
module.exports = {
  questionRouter,
};
