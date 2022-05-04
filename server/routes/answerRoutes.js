const express = require("express");
const {
  postAnswer,
  deleteAnswer,
  editAnswer,
  voteAnswer,
  acceptAnswer,
} = require("../controllers/answerController");

const answerRouter = express.Router();
answerRouter.post("/new", postAnswer);
answerRouter.put("/update", editAnswer);
answerRouter.put("/vote", voteAnswer);
answerRouter.put("/accept", acceptAnswer);
answerRouter.delete("/:quesId/:ansId", deleteAnswer);
module.exports = {
  answerRouter,
};
