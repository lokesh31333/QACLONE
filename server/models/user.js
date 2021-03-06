const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const schemaCleaner = require("../utils/schemaCleaner");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 3,
    maxlength: 20,
    required: true,
    trim: true,
    unique: true,
  },
  reputationScore: {
    type: Number,
    default: 0,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: { type: String, default: "user",enum: ['user','admin'] },
  email: { type: String },
  questions: [
    {
      quesId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      rep: { type: Number, default: 0 },
    },
  ],
  bookmarks: [ String
  ],
  answers: [
    {
      ansId: { type: mongoose.Schema.Types.ObjectId, ref: "Answer" },
      rep: { type: Number, default: 0 },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.plugin(uniqueValidator);
schemaCleaner(userSchema);

module.exports = mongoose.model("User", userSchema);
