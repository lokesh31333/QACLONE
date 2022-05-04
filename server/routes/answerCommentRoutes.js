const express = require("express");
const {
  addAnsComment,
  deleteAnsComment,
  editAnsComment,
} = require("../controllers/answerCommentController");

const answerCommentRouter = express.Router();
answerCommentRouter.post("/new", addAnsComment);
answerCommentRouter.put("/update", editAnsComment);
answerCommentRouter.delete("/:quesId/:ansId", deleteAnsComment);
module.exports = {
  answerCommentRouter,
};
