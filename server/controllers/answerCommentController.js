const User = require("../models/user");
const Question = require("../models/question");

const addAnsComment = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, ansId, body } = req.body;

  if (body.trim() === "" || body.length < 5) {
    throw new Error("Comment must be atleast 5 characters long.");
  }

  try {
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    const targetAnswer = question.answers.find(
      (a) => a._id.toString() === ansId
    );

    if (!targetAnswer) {
      throw new Error(`Answer with ID: '${ansId}' does not exist in DB.`);
    }

    targetAnswer.comments.push({
      body,
      author: loggedUser.id,
    });

    question.answers = question.answers.map((a) =>
      a._id.toString() !== ansId ? a : targetAnswer
    );

    const savedQues = await question.save();
    const populatedQues = await savedQues
      .populate("answers.comments.author", "username")
      .execPopulate();

    const updatedAnswer = populatedQues.answers.find(
      (a) => a._id.toString() === ansId
    );
    return res.status(200).json(updatedAnswer.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const deleteAnsComment = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, ansId, commentId } = req.params;

  try {
    const user = await User.findById(loggedUser.id);
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    const targetAnswer = question.answers.find(
      (a) => a._id.toString() === ansId
    );

    if (!targetAnswer) {
      throw new Error(`Answer with ID: '${ansId}' does not exist in DB.`);
    }

    const targetComment = targetAnswer.comments.find(
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

    targetAnswer.comments = targetAnswer.comments.filter(
      (c) => c._id.toString() !== commentId
    );

    question.answers = question.answers.map((a) =>
      a._id.toString() !== ansId ? a : targetAnswer
    );

    await question.save();
    return res.status(200).send(commentId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const editAnsComment = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, ansId, commentId, body } = req.body;

  try {
    if (body.trim() === "" || body.length < 5) {
      throw new Error("Comment must be atleast 5 characters long.");
    }
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    const targetAnswer = question.answers.find(
      (a) => a._id.toString() === ansId
    );

    if (!targetAnswer) {
      throw new Error(`Answer with ID: '${ansId}' does not exist in DB.`);
    }

    const targetComment = targetAnswer.comments.find(
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

    targetAnswer.comments = targetAnswer.comments.map((c) =>
      c._id.toString() !== commentId ? c : targetComment
    );
    question.answers = question.answers.map((a) =>
      a._id.toString() !== ansId ? a : targetAnswer
    );

    const savedQues = await question.save();
    const populatedQues = await savedQues
      .populate("answers.comments.author", "username")
      .execPopulate();

    const updatedAnswer = populatedQues.answers.find(
      (a) => a._id.toString() === ansId
    );

    return res.status(200).json(updatedAnswer.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addAnsComment,
  deleteAnsComment,
  editAnsComment,
};
