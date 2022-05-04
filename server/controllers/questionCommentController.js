const Question = require("../models/question");
const User = require("../models/user");

const addQuesComment = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, body } = req.body;

  if (body.trim() === "" || body.length < 5) {
    throw new Error("Comment must be atleast 5 characters long.");
  }

  try {
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    question.comments.push({
      body,
      author: loggedUser.id,
    });

    const savedQues = await question.save();
    const populatedQues = await savedQues
      .populate("comments.author", "username")
      .execPopulate();

    return res.status(200).json(populatedQues.comments);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
const deleteQuesComment = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, commentId } = req.query;

  try {
    const user = await User.findById(loggedUser.id);
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    const targetComment = question.comments.find(
      (c) => c._id.toString() === commentId
    );

    if (!targetComment) {
      throw new Error(`Comment with ID: '${commentId}' does not exist in DB.`);
    }

    if (
      targetComment.author.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      throw new Error("Access is denied.");
    }

    question.comments = question.comments.filter(
      (c) => c._id.toString() !== commentId
    );
    await question.save();
    return res.status(200).send(commentId);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
const editQuesComment = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, commentId, body } = req.body;

  if (body.trim() === "" || body.length < 5) {
    throw new Error("Comment must be atleast 5 characters long.");
  }

  try {
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    const targetComment = question.comments.find(
      (c) => c._id.toString() === commentId
    );

    if (!targetComment) {
      throw new Error(`Comment with ID: '${commentId}' does not exist in DB.`);
    }

    if (targetComment.author.toString() !== loggedUser.id.toString()) {
      throw new Error("Access is denied.");
    }

    targetComment.body = body;
    targetComment.updatedAt = Date.now();

    question.comments = question.comments.map((c) =>
      c._id.toString() !== commentId ? c : targetComment
    );
    const savedQues = await question.save();
    const populatedQues = await savedQues
      .populate("comments.author", "username")
      .execPopulate();

    return res.status(200).json(populatedQues.comments);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports = {
  addQuesComment,
  deleteQuesComment,
  editQuesComment,
};
