const Question = require("../models/question");
const User = require("../models/user");
const { questionValidator } = require("../utils/validators");
const {
  paginateResults,
  downvoteIt,
  upvoteIt,
  quesRep,
} = require("../utils/helperFuncs");

const getQuestions = async (req, res) => {
  const { sortBy, filterByTag, filterBySearch, page, limit } = req.query;

  let sortQuery;
  switch (sortBy) {
    case "votes":
      sortQuery = { points: -1 };
      break;
    case "views":
      sortQuery = { views: -1 };
      break;
    case "newest":
      sortQuery = { createdAt: -1 };
      break;
    case "oldest":
      sortQuery = { createdAt: 1 };
      break;
    default:
      sortQuery = { hotAlgo: -1 };
  }

  let findQuery = {};
  if (filterByTag) {
    findQuery = { tags: { $all: [filterByTag] } };
  } else if (filterBySearch) {
    findQuery = {
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

const viewQuestion = async (req, res) => {
  const { quesId } = req.query;

  try {
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    question.views++;
    const savedQues = await question.save();
    const populatedQues = await savedQues
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("answers.author", "username")
      .populate("answers.comments.author", "username")
      .execPopulate();

    return res.status(200).json(populatedQues);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const editQuestion = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, title, body, tags } = req.body;

  try {
    const { errors, valid } = questionValidator(title, body, tags);
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
      { new: true }
    )
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("answers.author", "username")
      .populate("answers.comments.author", "username");

    return res.status(200).json(updatedQues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const postQuestion = async (req, res) => {
  try {
    const loggedUser = req.user;
    const { title, body, tags } = req.body;

    const { errors, valid } = questionValidator(title, body, tags);
    if (!valid) {
      throw new Error(errors[0]);
    }
    const author = await User.findById(loggedUser.id);
    const newQuestion = new Question({
      title,
      body,
      tags,
      author: author._id,
    });
    const savedQues = await newQuestion.save();
    const populatedQues = await savedQues
      .populate("author", "username")
      .execPopulate();

    author.questions.push({ quesId: savedQues._id });
    await author.save();

    return res.status(200).json(populatedQues);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteQuestion = async (req, res) => {
  const loggedUser = req.user;
  const { quesId } = req.params;

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
    return res.status(200).json({ deletedId: question._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const voteQuestion = async (req, res) => {
  const loggedUser = req.user;
  const { quesId, voteType } = req.body;

  try {
    const user = await User.findById(loggedUser.id);
    const question = await Question.findById(quesId);
    if (!question) {
      throw new Error(`Question with ID: ${quesId} does not exist in DB.`);
    }

    if (question.author.toString() === user._id.toString()) {
      throw new Error("You can't vote for your own post.");
    }

    let votedQues;
    if (voteType.toLowerCase() === "upvote") {
      votedQues = upvoteIt(question, user);
    } else {
      votedQues = downvoteIt(question, user);
    }

    votedQues.hotAlgo =
      Math.log(Math.max(Math.abs(votedQues.points), 1)) +
      Math.log(Math.max(votedQues.views * 2, 1)) +
      votedQues.createdAt / 4500;

    const savedQues = await votedQues.save();
    const author = await User.findById(question.author);
    const addedRepAuthor = quesRep(question, author);
    await addedRepAuthor.save();

    const saved = await savedQues
      .populate("author", "username")
      .populate("comments.author", "username")
      .populate("answers.author", "username")
      .populate("answers.comments.author", "username")
      .execPopulate();
    return res.status(200).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  getQuestions,
  viewQuestion,
  editQuestion,
  postQuestion,
  deleteQuestion,
  voteQuestion,
};
