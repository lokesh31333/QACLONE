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
      .sort({ createdAt: -1 }).select("id title points createdAt").limit(5);

    const recentAnswers = await Question.find({
      answers: { $elemMatch: { author: user._id } },
    })
      .sort({ createdAt: -1 }).select("id title points createdAt").limit(5);

    const totalQuestions = recentQuestions.length;
    //console.log("totalQuestions", totalQuestions);
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


    // console.log(questionsLen)
    var badges = []
    for (const utag in userTagWithScore) {
      var temp = userTagWithScore[utag].totalScore;
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
        type: "tag",
      }
      badges.push(badge)
    }

    //  curious
    const allUserQuestion = await Question.find({ author: user._id })

    const questionsLen = allUserQuestion.length;
    var customBadge = 'Curious'
    var customBadgeValue
    if (questionsLen <= 2) {
      customBadgeValue = 'Bronze'
    } else if (questionsLen > 2 && questionsLen < 5) {
      customBadgeValue = 'Silver'
    } else {
      customBadgeValue = 'Gold'
    }
    badges.push({
      badgeName: customBadge,
      badgeValue: customBadgeValue,
      count: 1,
      type: "others",
    })

    // Popular: Based on the reputation
    customBadge = 'Popular'
    if (userReputationScore <= 10) {
      customBadgeValue = 'Bronze'
    } else if (userReputationScore > 10 && userReputationScore < 15) {
      customBadgeValue = 'Silver'
    } else {
      customBadgeValue = 'Gold'
    }
    badge = {
      badgeName: customBadge,
      badgeValue: customBadgeValue,
      count: 1,
      type: "others",
    }
    badges.push(badge)


    //Helpfulness: Based on the number of answers answered
    customBadge = 'Helpfulness'
    const totalUserAnswers = await Question.find({
      answers: { $elemMatch: { author: user._id } },
    })
    const answerCount = await totalUserAnswers.length;
    console.log("answerCount", answerCount);
    if (answerCount <= 2) {
      customBadgeValue = 'Bronze'
    } else if (answerCount > 2 && answerCount < 5) {
      customBadgeValue = 'Silver'
    } else {
      customBadgeValue = 'Gold'
    }
    badge = {
      badgeName: customBadge,
      badgeValue: customBadgeValue,
      count: 1,
      type: "others",
    }
    badges.push(badge)

    //Sportsmanship: Based on the number of upvotes given
    //Critic: Based on the number of downvotes given
    customBadge = 'Sportsmanship';
    let criticBadge = 'Critic';
    let upvoteCount = 0;
    let downvoteCount = 0;

    const allQuestions = await Question.find({}).select("answers upvotedBy downvotedBy");

    for (let i = 0; i < allQuestions.length; i++) {
      if (allQuestions[i].upvotedBy.includes(user._id.toString())) {
        upvoteCount++;
      }
      if (allQuestions[i].downvotedBy.includes(user._id.toString())) {
        downvoteCount++;
      }

      for (let j = 0; j < allQuestions[i].answers.length; j++) {
        if (allQuestions[i].answers[j].upvotedBy.includes(user._id.toString())) {
          upvoteCount++;
        }
        if (allQuestions[i].answers[j].downvotedBy.includes(user._id.toString())) {
          downvoteCount++;
        }
      }

    }
    if (upvoteCount <= 2) {
      customBadgeValue = 'Bronze'
    } else if (upvoteCount > 2 && upvoteCount < 5) {
      customBadgeValue = 'Silver'
    } else {
      customBadgeValue = 'Gold'
    }
    console.log("upvoteCount", upvoteCount, downvoteCount);
    badge = {
      badgeName: customBadge,
      badgeValue: customBadgeValue,
      count: 1,
      type: "others",
    }
    badges.push(badge)

    // For critic badge
    if (downvoteCount <= 2) {
      customBadgeValue = 'Bronze'
    } else if (downvoteCount > 2 && downvoteCount < 5) {
      customBadgeValue = 'Silver'
    } else {
      customBadgeValue = 'Gold'
    }
    badge = {
      badgeName: criticBadge,
      badgeValue: customBadgeValue,
      count: 1,
      type: "others",
    }
    badges.push(badge)

    // Gold badge: Notable Question: receives more than 5 views
    //Gold badge: Famous Question: receives more than 15 views
    let NotableBadge = 'Notable Question'
    let FamousBagde = 'Famous Question'
    let NotablebadgeCount = 0
    let FamousbadgeCount = 0
    for (let i = 0; i < allUserQuestion.length; i++) {
      let views = allUserQuestion[i].views;
      if (views > 15) {
        FamousbadgeCount++;
      } else if (views > 5) {
        NotablebadgeCount++;
      }
    }

    badge = {
      badgeName: NotableBadge,
      badgeValue: 'Gold',
      count: NotablebadgeCount,
      type: "others",
    }
    badges.push(badge)
    badge = {
      badgeName: FamousBagde,
      badgeValue: 'Gold',
      count: FamousbadgeCount,
      type: "others",
    }
    badges.push(badge)

    //pundit
    let PunditBadge = 'Pundit';
    let PunditBadgeCount = 0;
    const recentQComments = await Question.find({
      comments: { $elemMatch: { author: user._id } },
    });
    const recentAComments = await Question.find({
      answers: { $elemMatch: { comments: { $elemMatch: { author: user._id } } } },
    });

    if (recentQComments.length + recentAComments.length >= 3) {
      PunditBadgeCount++;
    }

    console.log("recentComments", recentQComments.length + recentAComments.length);
    badge = {
      badgeName: PunditBadge,
      badgeValue: 'Silver',
      count: PunditBadgeCount,
      type: "others",
    }
    badges.push(badge)
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
  }
  catch (error) {
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
