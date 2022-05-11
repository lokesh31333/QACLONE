const Question = require("../models/question");
const ReputationScore = require("../models/reputationScore");
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

    const totalQuestions = recentQuestions.length;
    const totalAnswers = recentAnswers.length;

    const getReputationScore = await ReputationScore.aggregate([
      {
        $match: {
          author: user._id,
        },
      },
      {
        $group: {
          _id: null,
          totalScore: {
            $sum: "$score",
          },
        },
      },
    ]);
    const userReputationScore =
      getReputationScore && getReputationScore.length > 0
        ? getReputationScore[0].totalScore
        : 0;
    let badge = "No Badge";
    if (userReputationScore > 20) {
      badge = "Gold";
    } else if (userReputationScore <= 14 && userReputationScore > 10) {
      badge = "Silver";
    } else if (userReputationScore > 0) {
      badge = "Bronze";
    }
    return res.status(200).json({
      id: user._id,
      username: user.username,
      role: user.role,
      questions: user.questions,
      answers: user.answers,
      createdAt: user.createdAt,
      recentQuestions,
      recentAnswers,
      reputation: userReputationScore,
      totalQuestions,
      totalAnswers,
      userReputationScore,
      badge,
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
