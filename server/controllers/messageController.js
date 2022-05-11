const Message = require("../models/message");
const User = require('../models/user');

const getAllUsersWhoInteracted = async (req, res) => {
  const loggedUser = req.user;
  //const {username} = req.params;
  console.log("In get messages", loggedUser);

  try {
    const messagesSent = JSON.parse(JSON.stringify(await Message.distinct("receiver", {'sender':loggedUser.id} )))
    const messagesReceived = JSON.parse(JSON.stringify(await Message.distinct("sender", {'receiver':loggedUser.id} )))
    const unionOtherUsers = [...new Set([...messagesSent, ...messagesReceived])];

    //TODO: Will it have profile image? gravatar where is it stored?
    const otherUserDetsils = await User.find({_id:  { $in: unionOtherUsers } }).select("username");
    console.log("other users", unionOtherUsers, otherUserDetsils)

    return res.status(200).json(otherUserDetsils);
  } catch (err) {
    console.log("Err", err)
    res.status(500).json({message: err.message});
  }
}

const getConversation = async (req, res) => {
  const loggedUser = req.user.id;
  const {otherUser} = req.body;
  console.log("In get a single convo", loggedUser, otherUser);

  try {
    const convo = await Message.find( {
      $or: [
        { $and: [ {'sender': loggedUser},  {'receiver': otherUser} ] },
        { $and: [ {'sender': otherUser},  {'receiver': loggedUser} ] }
      ]
    }, null, {sort: {createdAt: 1} });

    console.log("Users", loggedUser, otherUser)
    return res.status(200).json(convo);
  } catch (err) {
    console.log("Err", err)
    res.status(500).json({message: err.message});
  }
}

const addMessage = async (req, res) => {
  const loggedUser = req.user.id;
  console.log("In get add user", loggedUser, req.body);

  try {
    const addmsg = await new Message(req.body).save();
    console.log("adding message", addmsg);
    return res.status(200).json({"added": "yes"});
  } catch (err) {
    console.log("Err", err)
    res.status(500).json({message: err.message});
  }
}


module.exports = {
  getAllUsersWhoInteracted,
  getConversation,
  addMessage
};
