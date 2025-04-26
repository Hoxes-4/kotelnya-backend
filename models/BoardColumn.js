const mongoose = require('mongoose');

const boardColumnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BoardTask' }]
}, { timestamps: true });

module.exports = mongoose.model('BoardColumn', boardColumnSchema);