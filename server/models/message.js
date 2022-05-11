const mongoose = require('mongoose');
const schemaCleaner = require('../utils/schemaCleaner');

const messageSchema = new mongoose.Schema({
  sender: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  receiver: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  message: {
    type: String,
    trim: true
  }
});

schemaCleaner(messageSchema);

module.exports = mongoose.model('Message', messageSchema);
