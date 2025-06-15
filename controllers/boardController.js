const Board = require('../models/Board');
const BoardColumn = require('../models/BoardColumn');
const Project = require('../models/Project');
const Task = require('../models/BoardTask');
const mongoose = require('mongoose');

const populateBoard = (query) => {
  return query
    .populate({
      path: 'tasks',
      populate: {
        path: 'assignee',
        model: 'User',
        select: 'username email avatarUrl'
      }
    })
    .populate('columns');
};


exports.createBoard = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(404).json({ message: 'Проект не найден' });
    }

    const currentUserRole = project.users.find(u => u.userId.equals(req.user.id));
    if (!currentUserRole || (currentUserRole.role !== 'owner' && currentUserRole.role !== 'admin')) {
        return res.status(403).json({ message: 'У вас нет прав для создания досок в этом проекте' });
    }

    const board = await Board.create({ title });

    await Project.findByIdAndUpdate(projectId, {
      $push: { boards: board._id }
    });

    const populatedBoard = await populateBoard(Board.findById(board._id)).lean();

    res.status(201).json(populatedBoard);
  } catch (err) {
    console.error("Ошибка создания доски:", err);
    res.status(500).json({ message: 'Ошибка создания доски', error: err.message });
  }
};

exports.getBoardById = async (req, res) => {
  try {
    const boardId = req.params.id;
    let board = await populateBoard(Board.findById(boardId)).lean();

    if (!board) {
      return res.status(404).json({ message: 'Доска не найдена' });
    }

    const project = await Project.findOne({ boards: boardId })
      .populate('users.userId', 'username email avatarUrl');
      
    if (!project) {
      return res.status(404).json({ message: 'Проект, связанный с доской, не найден' });
    }

    const isMember = project.users.some(userEntry =>
        userEntry.userId && userEntry.userId._id.equals(req.user.id)
    );
    if (!isMember) {
        return res.status(403).json({ message: 'У вас нет доступа к этой доске' });
    }

    board.projectUsers = project.users.map(userEntry => ({
        _id: userEntry.userId._id,
        username: userEntry.userId.username,
        email: userEntry.userId.email,
        avatarUrl: userEntry.userId.avatarUrl,
        role: userEntry.role
    }));

    res.json(board);
  } catch (err) {
    console.error("Ошибка получения доски:", err);
    res.status(500).json({ message: 'Ошибка получения доски', error: err.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const boardId = req.params.id;
    const { title, columnOrder, columns } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
        return res.status(404).json({ message: 'Доска не найдена' });
    }

    const project = await Project.findOne({ boards: boardId });
    if (!project) {
        return res.status(404).json({ message: 'Проект, связанный с доской, не найден' });
    }

    const currentUserRole = project.users.find(u => u.userId.equals(req.user.id));
    if (!currentUserRole || (currentUserRole.role !== 'owner' && currentUserRole.role !== 'admin')) {
        return res.status(403).json({ message: 'У вас нет прав для обновления этой доски' });
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      { title, columnOrder },
      { new: true, runValidators: true }
    );

    if (columns && Array.isArray(columns)) {
      await Promise.all(columns.map(async col => {
        if (col._id && col.tasks) {
          await BoardColumn.findByIdAndUpdate(
            col._id,
            { tasks: col.tasks },
            { new: true }
          );
        }
      }));
    }

    let populatedBoard = await populateBoard(Board.findById(updatedBoard._id)).lean();

    const projectWithUsers = await Project.findOne({ boards: boardId })
      .populate('users.userId', 'username email avatarUrl');

    if (projectWithUsers) {
      populatedBoard.projectUsers = projectWithUsers.users.map(userEntry => ({
          _id: userEntry.userId._id,
          username: userEntry.userId.username,
          email: userEntry.userId.email,
          avatarUrl: userEntry.userId.avatarUrl,
          role: userEntry.role
      }));
    }

    res.json(populatedBoard);
  } catch (err) {
    console.error("Ошибка обновления доски:", err);
    res.status(500).json({ message: 'Ошибка обновления доски', error: err.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const boardId = req.params.id;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Доска не найдена' });
    }

    const project = await Project.findOne({ boards: boardId });
    if (!project) {
        return res.status(404).json({ message: 'Проект, связанный с доской, не найден' });
    }

    const currentUserRole = project.users.find(u => u.userId.equals(req.user.id));
    if (!currentUserRole || (currentUserRole.role !== 'owner' && currentUserRole.role !== 'admin')) {
        return res.status(403).json({ message: 'У вас нет прав для удаления этой доски' });
    }

    await Project.updateMany(
      { boards: boardId },
      { $pull: { boards: boardId } }
    );

    await BoardColumn.deleteMany({ _id: { $in: board.columns } });

    await Task.deleteMany({ _id: { $in: board.tasks } });

    await Board.deleteOne({ _id: boardId });
    res.json({ message: 'Доска успешно удалена' });
  } catch (err) {
    console.error("Ошибка удаления доски:", err);
    res.status(500).json({ message: 'Ошибка удаления доски', error: err.message });
  }
};