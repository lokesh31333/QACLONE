const Question = require("../models/question");
const Tag = require("../models/tag");
const errors = require("../utils/errors");


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

const createTag = async (req, res) => {
  console.log(`inside createTag backend`);
  console.log(`printing req data`, JSON.stringify(req.body));

  const tag = req.body;

  try {
    const createdTag = await Tag.create(tag);

    const result = await Tag.findOne(
      { _id: createdTag.id  } //todo handle media
    );

    res.status(201).json(result);
    return;
  } catch (err) {
    console.error(err);
    if (err.original) {
      res.status(500).json({ status: 500, message: err.original.sqlMessage });
    } else {
      res.status(500).json(errors.serverError);
    }
  }
};


module.exports = {
  getAllTags,
  createTag
};
