const Board = require('../models/Board');
const BoardTask = require('../models/BoardTask');
const BoardColumn = require('../models/BoardColumn');

exports.createTask = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const { title, description, dueDate, assignee, columnId } = req.body;

    const task = await BoardTask.create({
      title,
      description,
      dueDate,
      assignee,
    });

    await Board.findByIdAndUpdate(boardId, {
      $push: { tasks: task._id }
    });

    if (columnId) {
      await BoardColumn.findByIdAndUpdate(columnId, {
        $push: { tasks: task._id }
      });
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка создания задачи', error: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await BoardTask.findById(req.params.id).populate('assignee');

    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения задачи', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await BoardTask.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления задачи', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await BoardTask.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    await BoardColumn.updateMany(
      { tasks: taskId },
      { $pull: { tasks: taskId } }
    );

    res.json({ message: 'Задача удалена и исключена из всех колонок' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления задачи', error: err.message });
  }
};
