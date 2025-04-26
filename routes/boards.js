const express = require('express');
const router = express.Router();
const Board = require('../models/Board');

router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('tasks')
      .populate('columns');
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения доски' });
  }
});

router.post('/', async (req, res) => {
  try {
    const board = await Board.create(req.body);
    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ message: 'Ошибка создания доски' });
  }
});

module.exports = router;