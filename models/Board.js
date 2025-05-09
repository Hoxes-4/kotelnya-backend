const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({

  title: {type: String, required: true,},
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BoardTask' }],
  columns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BoardColumn' }],
  columnOrder: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);