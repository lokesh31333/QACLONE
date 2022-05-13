const express = require("express");
const { getAllTags,createTag } = require("../controllers/tagsController");

const tagsRouter = express.Router();

tagsRouter.get("/", getAllTags);
tagsRouter.post("/createtag", createTag);


module.exports = {
  tagsRouter,
};
