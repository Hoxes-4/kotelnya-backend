const Board = require('../models/Board');
const BoardTask = require('../models/BoardTask');
const BoardColumn = require('../models/BoardColumn');
const User = require('../models/User');

const populateTask = (query) => {
  return query.populate('assignee', 'username email avatarUrl');
};

exports.createTask = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const { title, description, dueDate, assignee, columnId } = req.body;

    if (assignee && assignee.length > 0) {
      const assigneeIds = Array.isArray(assignee) ? assignee : [assignee];
      
      const existingUsers = await User.find({ _id: { $in: assigneeIds } });
      if (existingUsers.length !== assigneeIds.length) {
        return res.status(404).json({ message: 'Один или несколько назначенных пользователей не найдены' });
      }
    }

    const task = await BoardTask.create({
      title,
      description,
      dueDate,
      assignee: assignee ? (Array.isArray(assignee) ? assignee : [assignee]) : [],
    });

    await Board.findByIdAndUpdate(boardId, {
      $push: { tasks: task._id }
    });

    if (columnId) {
      await BoardColumn.findByIdAndUpdate(columnId, {
        $push: { tasks: task._id }
      });
    }

    const populatedTask = await populateTask(BoardTask.findById(task._id)).lean();

    res.status(201).json(populatedTask);
  } catch (err) {
    console.error("Ошибка создания задачи:", err);
    res.status(500).json({ message: 'Ошибка создания задачи', error: err.message });
  }
};


exports.getTaskById = async (req, res) => {
  try {
    const task = await populateTask(BoardTask.findById(req.params.id));

    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    res.json(task);
  } catch (err) {
    console.error("Ошибка получения задачи:", err);
    res.status(500).json({ message: 'Ошибка получения задачи', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

    if (updates.assignee !== undefined) {
      const assigneeIds = Array.isArray(updates.assignee) ? updates.assignee : (updates.assignee ? [updates.assignee] : []);

      if (assigneeIds.length > 0) {
        const existingUsers = await User.find({ _id: { $in: assigneeIds } });
        if (existingUsers.length !== assigneeIds.length) {
          return res.status(404).json({ message: 'Один или несколько назначенных пользователей не найдены' });
        }
      }
      updates.assignee = assigneeIds;
    }

    const task = await BoardTask.findByIdAndUpdate(taskId, updates, { new: true, runValidators: true });

    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    const populatedTask = await populateTask(BoardTask.findById(task._id)).lean();

    res.json(populatedTask);
  } catch (err) {
    console.error("Ошибка обновления задачи:", err);
    res.status(500).json({ message: 'Ошибка обновления задачи', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await BoardTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Задача не найдена' });
    }

    await Board.updateMany(
      { tasks: taskId },
      { $pull: { tasks: taskId } }
    );

    await BoardColumn.updateMany(
      { tasks: taskId },
      { $pull: { tasks: taskId } }
    );

    await BoardTask.deleteOne({ _id: taskId });

    res.json({ message: 'Задача успешно удалена' });
  } catch (err) {
    console.error("Ошибка удаления задачи:", err);
    res.status(500).json({ message: 'Ошибка удаления задачи', error: err.message });
  }
};
