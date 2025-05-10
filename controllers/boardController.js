const Board = require('../models/Board');
const BoardColumn = require('../models/BoardColumn')
const Project = require('../models/Project');

exports.createBoard = async (req, res) => {
  try {
    const projectId = req.params.id;

    const board = await Board.create(req.body);

    // Привязываем к проекту
    await Project.findByIdAndUpdate(projectId, {
      $push: { boards: board._id }
    });

    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка создания доски', error: err.message });
  }
};

exports.getBoardsByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('boards');

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    res.json(project.boards);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения досок', error: err.message });
  }
};

exports.getNotesByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('notes');


    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    res.json(project.notes);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения заметок', error: err.message });
  }

}

exports.getBoardById = async (req, res) => {
    try {
      const board = await Board.findById(req.params.id)
        .populate('tasks')
        .populate('columns');

      if (!board) {
        return res.status(404).json({ message: 'Доска не найдена' });
      }
  
      res.json(board);
    } catch (err) {
      res.status(500).json({ message: 'Ошибка получения доски', error: err.message });
    }
  };
  
  exports.updateBoard = async (req, res) => {
    try {
      const { columns } = req.body;
      const board = await Board.findByIdAndUpdate(req.params.id, { title: req.body.title, columnOrder: req.body.columnOrder, }, {
        new: true,
      }).populate('tasks').populate('columns');
      
  
      if (!board) {
        return res.status(404).json({ message: 'Доска не найдена' });
      }

      await Promise.all(columns.map(col => {
        return BoardColumn.findByIdAndUpdate(
          col._id,
          { tasks: col.tasks },
          { new: true }
        );
      }));

      const updated = await Board.findById(req.params.id)
        .populate('tasks')
        .populate('columns');
  
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Ошибка обновления доски', error: err.message });
    }
  };
  
  exports.deleteBoard = async (req, res) => {
    try {
      const board = await Board.findByIdAndDelete(req.params.id);
  
      if (!board) {
        return res.status(404).json({ message: 'Доска не найдена' });
      }
  
      res.json({ message: 'Доска удалена' });
    } catch (err) {
      res.status(500).json({ message: 'Ошибка удаления доски', error: err.message });
    }
  };