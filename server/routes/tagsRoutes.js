const express = require("express");
const { getAllTags } = require("../controllers/tagsController");

const tagsRouter = express.Router();

tagsRouter.get("/", getAllTags);

module.exports = {
  tagsRouter,
};
