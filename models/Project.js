const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'В процессе',
  },
  imageUrl: {
    type: String,
    default: "В процессе",
  },
  users: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['owner', 'admin', 'member'],
        default: 'member',
      },
    },
  ],
  boards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
    },
  ],
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
