const User = require("../models/user");
const Question = require("../models/question");
const { upvoteIt, downvoteIt, ansRep } = require("../utils/helperFuncs");
const ReputationScore = require("../models/reputationScore");

const postAnswer = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, body } = req.body;

  try {
    if (body.trim() === "" || body.length < 30) {
      throw new Error("Answer must be atleast 30 characters long.");
    }

    const author = await User.findById(loggedUser.id);
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    question.answers.push({
      body,
      author: author._id,
    });
    const savedQues = await question.save();
    const populatedQues = await savedQues
      .populate("answers.author", "username")
      .populate("answers.comments.author", "username")
      .execPopulate();

    author.answers.push({
      ansId: savedQues.answers[savedQues.answers.length - 1]._id,
    });
    await author.save();

    return res.status(200).json(populatedQues.answers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const deleteAnswer = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, ansId } = req.params;

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

    if (
      targetAnswer.author.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      throw new Error("Access is denied.");
    }

    question.answers = question.answers.filter(
      (a) => a._id.toString() !== ansId
    );
    await question.save();
    return res.status(200).send(ansId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const editAnswer = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, ansId, body } = req.body;

  if (body.trim() === "" || body.length < 30) {
    throw new Error("Answer must be atleast 30 characters long.");
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

    if (targetAnswer.author.toString() !== loggedUser.id.toString()) {
      throw new Error("Access is denied.");
    }

    targetAnswer.body = body;
    targetAnswer.updatedAt = Date.now();

    question.answers = question.answers.map((a) =>
      a._id.toString() !== ansId ? a : targetAnswer
    );

    const savedQues = await question.save();
    const populatedQues = await savedQues
      .populate("answers.author", "username")
      .populate("answers.comments.author", "username")
      .execPopulate();

    return res.status(200).json(populatedQues.answers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const voteAnswer = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, ansId, voteType } = req.body;

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

    if (targetAnswer.author.toString() === user._id.toString()) {
      throw new Error("You can't vote for your own post.");
    }

    let votedAns;
    let reputationObject = {
      author: targetAnswer.author,
      questionId: quesId,
      answerId: ansId,
    };
    if (voteType.toLowerCase() === "upvote") {
      votedAns = upvoteIt(targetAnswer, user);
      reputationObject = {
        ...reputationObject,
        reputationScoreType: "UPVOTE_ANSWER",
        score: 5,
      };
    } else {
      votedAns = downvoteIt(targetAnswer, user);
      reputationObject = {
        ...reputationObject,
        reputationScoreType: "UPVOTE_ANSWER",
        score: -5,
      };
    }
    const reputationScore = new ReputationScore(reputationObject);
    await reputationScore.save();

    question.answers = question.answers.map((a) =>
      a._id.toString() !== ansId ? a : votedAns
    );

    const savedQues = await question.save();
    const populatedQues = await savedQues
      .populate("answers.author", "username")
      .populate("answers.comments.author", "username")
      .execPopulate();

    const author = await User.findById(targetAnswer.author);
    const addedRepAuthor = ansRep(targetAnswer, author);
    await addedRepAuthor.save();
    // const answerId = populatedQues.answers.find(
    //   (a) => a._id.toString() === ansId
    // );
    return res.status(200).json({ ...populatedQues._doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const acceptAnswer = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, ansId } = req.body;

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

    if (question.author.toString() !== loggedUser.id.toString()) {
      throw new Error("Only the author of question can accept answers.");
    }
    console.log(targetAnswer);
    if (!question.acceptedAnswer) {
      const reputationScore = new ReputationScore({
        author: targetAnswer.author,
        reputationScoreType: "ACCEPTED_ANSWER",
        questionId: quesId,
        answerId: ansId,
        score: 15,
      });
      question.acceptedAnswer = targetAnswer._id;
      await reputationScore.save();
    } else if (
      question.acceptedAnswer &&
      !question.acceptedAnswer.equals(targetAnswer._id)
    ) {
      const reputationScoreForNewAccpetedAnswer = new ReputationScore({
        author: targetAnswer.author,
        reputationScoreType: "ACCEPTED_ANSWER",
        questionId: quesId,
        answerId: ansId,
        score: 15,
      });
      const reputationScoreForOldAcceptedAnswer = new ReputationScore({
        author: question.acceptedAnswer.author,
        reputationScoreType: "REMOVED_ACCEPTED_ANSWER",
        questionId: quesId,
        answerId: ansId,
        score: -15,
      });
      question.acceptedAnswer = targetAnswer._id;
      await Promise.all([
        reputationScoreForNewAccpetedAnswer.save(),
        reputationScoreForOldAcceptedAnswer.save(),
      ]);
    } else {
      const reputationScoreForRemovedAcceptedAnswer = new ReputationScore({
        author: targetAnswer.author,
        reputationScoreType: "REMOVED_ACCEPTED_ANSWER",
        questionId: quesId,
        answerId: ansId,
        score: -15,
      });
      await reputationScoreForRemovedAcceptedAnswer.save();
      question.acceptedAnswer = null;
    }

    const savedQues = await question.save();
    const populatedQues = await savedQues
      .populate("answers.author", "username")
      .populate("answers.comments.author", "username")
      .execPopulate();

    return res.status(200).json(populatedQues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  postAnswer,
  deleteAnswer,
  editAnswer,
  voteAnswer,
  acceptAnswer,
};
