const Question = require("../models/question");
const User = require("../models/user");
const {questionValidator} = require("../utils/validators");
const {
  paginateResults,
  downvoteIt,
  upvoteIt,
  quesRep,
} = require("../utils/helperFuncs");
const {
  addQuestionToCache,
  updateQuestionVotePoints,
  updateQuestionViews,
  removeQuestionFromCache,
  updateQuestionFromCache,
} = require("./redisController");
const ReputationScore = require("../models/reputationScore");

const getQuestions = async (req, res) => {
  let {sortBy, filterByTag, filterBySearch, page, limit} = req.query;

  if (filterBySearch && !filterByTag) {
    const first = filterBySearch.indexOf("[");
    const second = filterBySearch.indexOf("]");
    filterByTag = filterBySearch.substring(first + 1, second);
    filterBySearch = filterBySearch.substring(second + 1)

  }
  console.log("query in get Q", req.query, filterBySearch, filterByTag);

  let sortQuery;
  switch (sortBy) {
    case "VOTES":
      sortQuery = {points: -1};
      break;
    case "VIEWS":
      sortQuery = {views: -1};
      break;
    case "NEWEST":
      sortQuery = {createdAt: -1};
      break;
    case "OLDEST":
      sortQuery = {createdAt: 1};
      break;
    default:
      sortQuery = {hotAlgo: -1};
  }

  let findQuery = {pendingApproval: false};
  if (filterByTag && filterBySearch) {
    findQuery = {
      ...findQuery, $and: [{
        tags: {$all: [filterByTag]}
      },
        {
          $or: [
            {
              title: {
                $regex: filterBySearch,
                $options: "i",
              },
            },
            {
              body: {
                $regex: filterBySearch,
                $options: "i",
              },
            },
          ]
        }]
    };
    console.log("findquery", findQuery)
  } else if (filterByTag) {
    findQuery = {...findQuery, tags: {$all: [filterByTag]}};
  } else if (filterBySearch) {
    findQuery = {
      ...findQuery,
      $or: [
        {
          title: {
            $regex: filterBySearch,
            $options: "i",
          },
        },
        {
          body: {
            $regex: filterBySearch,
            $options: "i",
          },
        },
      ],
    };
  }

  try {
    const quesCount = await Question.find(findQuery).countDocuments();
    const paginated = paginateResults(
      parseInt(page),
      parseInt(limit),
      quesCount
    );
    const questions = await Question.find(findQuery)
      .sort(sortQuery)
      .limit(parseInt(limit))
      .skip(paginated.startIndex)
      .populate("author", "username");

    const paginatedQues = {
      previous: paginated.results.previous,
      questions,
      next: paginated.results.next,
    };

    return res.status(200).json(paginatedQues);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
const getPendingQuestions = async (req, res) => {
  const {page, limit} = req.query;
  let findQuery = {pendingApproval: true};

  try {
    const quesCount = await Question.find(findQuery).countDocuments();
    const paginated = paginateResults(
      parseInt(page),
      parseInt(limit),
      quesCount
    );
    const questions = await Question.find(findQuery)
      .sort({_id: -1})
      .limit(parseInt(limit))
      .skip(paginated.startIndex)
      .populate("author", "username");

    const paginatedQues = {
      previous: paginated.results.previous,
      questions,
      next: paginated.results.next,
    };
    return res.status(200).json(paginatedQues);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const approveQuestion = async (req, res) => {
  const {quesId} = req.body;
  console.log(quesId);
  const updatedQues = await Question.findByIdAndUpdate(
    quesId,
    {pendingApproval: false},
    {new: true}
  )
    .populate("author", "username")
    .populate("comments.author", "username")
    .populate("answers.author", "username")
    .populate("answers.comments.author", "username");
  console.log(updatedQues);
  await addQuestionToCache(updatedQues);
  return res.status(200).json({message: "Question Approved"});
};

const viewQuestion = async (req, res) => {
  const {quesId} = req.query;

  try {
    const question = await Question.findById({
      _id: quesId,
    });
    if (!question) {
      throw new Error(
        `Question with ID: ${quesId} does not exist or pending approval.`
      );
    }

    question.views++;
    const savedQues = await question.save();
    await updateQuestionViews(question, question.views);
    const populatedQues = await savedQues
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("answers.author", "username")
      .populate("answers.comments.author", "username")
      .execPopulate();

    return res.status(200).json(populatedQues);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

const editQuestion = async (req, res) => {
  const loggedUser = req.user;
  const {quesId, title, body, tags} = req.body;

  try {
    const {errors, valid} = questionValidator(title, body, tags);
    if (!valid) {
      throw new Error(errors[0]);
    }

    const updatedQuesObj = {
      title,
      body,
      tags,
      updatedAt: Date.now(),
    };

    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    if (question.author.toString() !== loggedUser.id) {
      throw new Error("Access is denied.");
    }

    const updatedQues = await Question.findByIdAndUpdate(
      quesId,
      updatedQuesObj,
      {new: true}
    )
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("answers.author", "username")
      .populate("answers.comments.author", "username");
    await updateQuestionFromCache(updatedQues);
    return res.status(200).json(updatedQues);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

const postQuestion = async (req, res) => {
  try {
    const loggedUser = req.user;
    const {title, body, tags} = req.body;
    const isPendingApproval = req.isPendingApproval;

    const {errors, valid} = questionValidator(title, body, tags);
    if (!valid) {
      throw new Error(errors[0]);
    }
    const author = await User.findById(loggedUser.id);
    const newQuestion = new Question({
      title,
      body,
      tags,
      author: author._id,
      pendingApproval: isPendingApproval,
    });
    const savedQues = await newQuestion.save();
    const populatedQues = await savedQues
      .populate("author", "username")
      .execPopulate();

    author.questions.push({quesId: savedQues._id});
    await author.save();
    if (!isPendingApproval) {
      const addedToCache = await addQuestionToCache(populatedQues);
      console.log("addedToCache: ", addedToCache);
    }
    const totalQuestion = author.totalQuestions + 1;

    console.log("Queastion numbers===", totalQuestion, res.body)
    if (totalQuestion > 2 && totalQuestion < 5) {
      author.badges.filter(b => b.name === 'Curious').map(c => c.level = "Silver")
      console.log("Author updated silver", author)
    } else if (totalQuestion >= 5) {
      author.badges.filter(b => b.name === 'Curious').map(c => c.level = "Gold")
      console.log("Author updated gold", author)
    }

    await author.save()
    await author.update({$inc: {totalQuestions: 1}})

    return res.status(200).json(populatedQues);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

const deleteQuestion = async (req, res) => {
  const loggedUser = req.user;
  const {quesId} = req.params;

  try {
    const user = await User.findById(loggedUser.id);
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    if (
      question.author.toString() !== user._id.toString() &&
      user.role !== "admin"
    ) {
      throw new Error("Access is denied.");
    }

    await Question.findByIdAndDelete(quesId);
    await removeQuestionFromCache(quesId);
    return res.status(200).json({deletedId: question._id});
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

const voteQuestion = async (req, res) => {
    const loggedUser = req.user;
    const {quesId, voteType} = req.body;

    try {
      const user = await User.findById(loggedUser.id);
      const question = await Question.findById(quesId);
      if (!question) {
        throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
      }

      if (question.author.toString() === user._id.toString()) {
        throw new Error("You can't vote for your own post.");
      }
      let reputationObject = {author: question.author, questionId: quesId};
      let votedQues;

      if (voteType.toLowerCase() === "upvote") {
        votedQues = await upvoteIt(question, user);
        reputationObject = {
          ...reputationObject,
          reputationScoreType: "UPVOTE_QUESTION",
          score: 10,
        };
      } else {
        reputationObject = {
          ...reputationObject,
          reputationScoreType: "DOWNVOTE_QUESTION",
          score: -10,
        };
        votedQues = downvoteIt(question, user);
      }
      const reputationScore = new ReputationScore(reputationObject);
      await reputationScore.save();
      votedQues.hotAlgo =
        Math.log(Math.max(Math.abs(votedQues.points), 1)) +
        Math.log(Math.max(votedQues.views * 2, 1)) +
        votedQues.createdAt / 4500;

      const savedQues = await votedQues.save();
      const author = await User.findById(question.author);
      const addedRepAuthor = quesRep(question, author);
      await addedRepAuthor.save();
      console.log("new points", savedQues.points);
      await updateQuestionVotePoints(savedQues._id, savedQues.points);
      const saved = await savedQues
        .populate("author", "username")
        .populate("comments.author", "username")
        .populate("answers.author", "username")
        .populate("answers.comments.author", "username")
        .execPopulate();


      console.log("VOted quesss===", loggedUser.id, votedQues)
      if (voteType.toLowerCase() === "upvote") {
        let upvotesGiven = 0
        console.log("comparisn", loggedUser.id, votedQues.upvotedBy)
        if (votedQues.upvotedBy.includes(loggedUser.id.toString())) {
          upvotesGiven = user.upvotesGiven + 1;
          user.upvotesGiven = user.upvotesGiven + 1;
        } else {
          upvotesGiven = user.upvotesGiven - 1;
          user.upvotesGiven = user.upvotesGiven - 1;
        }
        console.log("Queastion upvote numbers===", upvotesGiven, res.body)
        if (upvotesGiven > 2 && upvotesGiven < 5) {
          user.badges.filter(b => b.name === 'Sportsmanship').map(c => c.level = "Silver")
          console.log("Author updated silver", user)
        } else if (upvotesGiven >= 5) {
          user.badges.filter(b => b.name === 'Sportsmanship').map(c => c.level = "Gold")
          console.log("Author updated gold", user)
        }
        await user.save();
      } else {
        let dvGiven = user.downvotesGiven - 1;
        console.log("comparisn", loggedUser.id, votedQues.upvotedBy)
        if (votedQues.downvotedBy.includes(loggedUser.id.toString())) {
          user.downvotesGiven = user.downvotesGiven - 1;
        } else {
          dvGiven = user.downvotesGiven + 1;
          user.downvotesGiven = user.downvotesGiven + 1;
        }
        console.log("Queastion upvote numbers===", dvGiven, res.body)
        if (dvGiven > 2 && dvGiven < 5) {
          user.badges.filter(b => b.name === 'Sportsmanship').map(c => c.level = "Silver")
          console.log("Author updated silver", user)
        } else if (dvGiven >= 5) {
          user.badges.filter(b => b.name === 'Sportsmanship').map(c => c.level = "Gold")
          console.log("Author updated gold", user)
        }
        await user.save();
      }
      return res.status(200).json(saved);
    } catch
      (err) {
      console.log("Errorrrrr", err)
      res.status(500).json({message: err.message});
    }
  }
;

const checkIfNeedAdminApproval = async (req, res, next) => {
  const {tags} = req.body;
  const tagsFromQues = await Question.find({}).select("tags");
  const tagsArray = tagsFromQues.map((t) => t.tags).flat();
  const currentQuestionTags = {};
  let needApproval = false;
  tagsArray.forEach((tag) => (currentQuestionTags[tag] = 1));
  tags.forEach((tag) => {
    if (!currentQuestionTags[tag]) {
      console.log("New tag detected!");
      needApproval = true;
    }
  });
  req.isPendingApproval = needApproval;
  return next();
};

module.exports = {
  getQuestions,
  viewQuestion,
  editQuestion,
  postQuestion,
  deleteQuestion,
  voteQuestion,
  checkIfNeedAdminApproval,
  getPendingQuestions,
  approveQuestion,
};
