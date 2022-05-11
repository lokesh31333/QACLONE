const express = require("express");
const {getAllUsersWhoInteracted, getConversation, addMessage} = require('../controllers/messageController');

const messagesRouter = express.Router();

messagesRouter.get("/", getAllUsersWhoInteracted);
messagesRouter.post("/conversation", getConversation);
messagesRouter.post("/add", addMessage);

module.exports = {
  messagesRouter,
};
