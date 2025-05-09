const mongoose = require('mongoose');

const boardTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '',},
  assignee: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dueDate: { type: Date,},
}, { timestamps: true });

module.exports = mongoose.model('BoardTask', boardTaskSchema);