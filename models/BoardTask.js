const mongoose = require('mongoose');

const boardTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  assignee: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dueDate: Date
}, { timestamps: true });

module.exports = mongoose.model('BoardTask', boardTaskSchema);