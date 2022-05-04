const Question = require("../models/question");

const getAllTags = async (req, res) => {
  try {
    const tagsFromQues = await Question.find({}).select("tags");
    const tagsArray = tagsFromQues.map((t) => t.tags).flat();

    let result = [];
    tagsArray.forEach((tag) => {
      const found = result.find((r) => r.tagName === tag);

      if (!found) {
        result.push({ tagName: tag, count: 1 });
      } else {
        result[result.indexOf(found)].count++;
      }
    });

    return res.status(200).json(result.sort((a, b) => b.count - a.count));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllTags,
};
