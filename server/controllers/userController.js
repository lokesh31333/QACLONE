const Question = require("../models/question");
const User = require("../models/user");

const getUser = async (req, res) => {
  try {
    const { username } = req.params;

    if (username.trim() === "") {
      throw new Error("Username must be provided.");
    }

    const user = await User.findOne({
      username: { $regex: new RegExp("^" + username + "$", "i") },
    });

    if (!user) {
      throw new Error(`User '${username}' does not exist.`);
    }

    const recentQuestions = await Question.find({ author: user._id })
      .sort({ createdAt: -1 })
      .select("id title points createdAt")
      .limit(5);

    const recentAnswers = await Question.find({
      answers: { $elemMatch: { author: user._id } },
    })
      .sort({ createdAt: -1 })
      .select("id title points createdAt")
      .limit(5);

    return res.status(200).json({
      id: user._id,
      username: user.username,
      role: user.role,
      questions: user.questions,
      answers: user.answers,
      createdAt: user.createdAt,
      recentQuestions,
      recentAnswers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllUsers = async (req, res) => {
  const allUsers = await User.find({}).select("username createdAt");
  return res.status(200).json(allUsers);
};

module.exports = {
  getUser,
  getAllUsers,
};
