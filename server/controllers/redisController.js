const { paginateResults } = require("../utils/helperFuncs");
const {
  getRedisJsonObjectKeys,
  getRedisJsonValue,
  setRedisJsonValue,
} = require("../utils/redisUtils");

const getQuestionsFromCache = async (req, res, next) => {
  const { sortBy, filterByTag, filterBySearch, page, limit } = req.query;
  const keys = await getRedisJsonObjectKeys("ALL_QUESTIONS", ".");
  if (
    !keys ||
    keys.length === 0 ||
    sortBy !== "HOT" ||
    filterByTag ||
    filterBySearch
  ) {
    console.log("Fetching from DB");
    return next();
  }
  console.log("Getting data from cache!", keys);
  const arrayOfPromises = [];
  const questionKeysToFetch = keys.slice(
    (page - 1) * limit,
    (page - 1) * limit + limit + 1
  );
  questionKeysToFetch.forEach((key) => {
    arrayOfPromises.push(getRedisJsonValue("ALL_QUESTIONS", `.${key}`));
  });
  const allData = await Promise.all([...arrayOfPromises]);
  const resultOfPagination = paginateResults(page, limit, keys.length);
  const paginatedQues = {
    previous: resultOfPagination.results.previous,
    questions: allData,
    next: resultOfPagination.results.next,
  };
  return res.status(200).json(paginatedQues);
};

const addQuestionToCache = async (question) => {
  const cacheResponse = await setRedisJsonValue(
    "ALL_QUESTIONS",
    `.${question._id}`,
    question
  );
  return cacheResponse;
};

const updateQuestionVotePoints = async (question, newVoteCount) => {
  const cacheResponse = await setRedisJsonValue(
    "ALL_QUESTIONS",
    `.${question._id}.points`,
    newVoteCount
  );
  return cacheResponse;
};

const updateQuestionViews = async (question, newViewsCount) => {
  const cacheResponse = await setRedisJsonValue(
    "ALL_QUESTIONS",
    `.${question._id}.views`,
    newViewsCount
  );
  return cacheResponse;
};

const updateQuestionFromCache = async (updatedQuestion) => {
  const allQuestions = await getRedisJsonValue("ALL_QUESTIONS", ".");
  allQuestions[updatedQuestion._id] = updatedQuestion;
  await setRedisJsonValue("ALL_QUESTIONS", ".", allQuestions);
  return;
};
const removeQuestionFromCache = async (questionId) => {
  const allQuestions = await getRedisJsonValue("ALL_QUESTIONS", ".");
  delete allQuestions[questionId];
  await setRedisJsonValue("ALL_QUESTIONS", ".", allQuestions);
  return;
};

module.exports = {
  getQuestionsFromCache,
  addQuestionToCache,
  updateQuestionVotePoints,
  updateQuestionViews,
  removeQuestionFromCache,
  updateQuestionFromCache,
};
