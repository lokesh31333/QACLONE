const mongoose = require("mongoose");
const schemaCleaner = require("../utils/schemaCleaner");

const reputationScoreSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Answer",
  },
  reputationScoreType: {
    type: String,
    enum: [
      "UPVOTE_QUESTION",
      "DOWNVOTE_QUESTION",
      "UPVOTE_ANSWER",
      "DOWNVOTE_ANSWER",
      "ACCEPTED_ANSWER",
      "REMOVED_ACCEPTED_ANSWER",
    ],
  },
  score: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

schemaCleaner(reputationScoreSchema);

module.exports = mongoose.model("ReputationScore", reputationScoreSchema);
