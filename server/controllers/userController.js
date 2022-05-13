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
    // let badge = "No Badge";
    // if (userReputationScore > 20) {
    //   badge = "Gold";
    // } else if (userReputationScore <= 14 && userReputationScore > 10) {
    //   badge = "Silver";
    // } else if (userReputationScore > 0) {
    //   badge = "Bronze";
    // }

    //  badges
    const userTagWithScore = await Question.aggregate([{
      $match: {
        author: user._id,
      },
    }, {
      $group: {
        _id: "$tags",
        totalScore: {
          $sum: "$points",
        },
      },

    }])

    // const allUserQuestion = await Question.find({ author: user._id })
    //const allquestions = await Question.find({})
    //console.log(allUserQuestions)
    // let questionsLen = allUserQuestion.length;
    // console.log(questionsLen)
    var badges = []
    console.log("userTagWithScore", userTagWithScore);
    for (const utag in userTagWithScore) {
      var temp = userTagWithScore[utag].totalScore;
      console.log("temp", utag);
      var badgeStringValue
      if (temp <= 10) {
        badgeStringValue = 'Bronze'
      } else if (temp <= 15) {
        badgeStringValue = 'Silver'
      } else {
        badgeStringValue = 'Gold'
      }
      var badge = {
        badgeName: userTagWithScore[utag]._id,
        badgeValue: badgeStringValue,
        count: 1,
      }
      badges.push(badge)
    }

    //

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
      // badge,
      badges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const insertbookmark = async (req, res) => {

  // console.log(req.body)
  const { ques } = req.body;
  const { authorization } = req.headers;
  const loggedUser = authorization;
  const { quesId } = ques;
  // console.log(quesId)
  // console.log(loggedUser)

  try {
    const user = await User.findById(loggedUser);
    // console.log(loggedUser.id)
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }
    if (question.author.toString() === user._id.toString()) {
      console.log("You cant bookmark your own question")
      throw new Error("You can't bookmark your own question.");
    }
    // console.log(User.find({_id:loggedUser,bookmarks: {"$in": [quesId]}}))
    // console.log(question)
    // console.log(user)
    // console.log(user.bookmarks)
    if (user.bookmarks.includes(quesId)) {
      // console.log("exists")
      // let arr = ['A', 'B', 'C'];
      // user.bookmarks = user.bookmarks.filter(e => e !== quesId);
      user.bookmarks.splice(user.bookmarks.indexOf(quesId), 1);
      user.save()
      console.log("removed")
    }
    else {
      user.bookmarks.push(quesId)
      user.save()
    }
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getAllUsers = async (req, res) => {
  const allUsers = await User.find({}).select("username createdAt");
  return res.status(200).json(allUsers);
};


module.exports = {
  getUser,
  getAllUsers,
  insertbookmark,

};
