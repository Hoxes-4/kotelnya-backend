const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const { title, users, status } = req.body;

    const project = await Project.create({
      title,
      status,
      users: users || [req.user.id], // если юзеров не указали — владелец по умолчанию
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка создания проекта', error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('users', '-password')
      .populate('boards')
      .populate('notes');

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения проекта', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
    try {
      const updates = req.body;
  
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      )
      .populate('users', '-password')
      .populate('boards')
      .populate('notes');
  
      if (!project) {
        return res.status(404).json({ message: 'Проект не найден' });
      }
  
      res.json(project);
    } catch (err) {
      res.status(500).json({ message: 'Ошибка обновления проекта', error: err.message });
    }
  };

  exports.removeUserFromProject = async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      const userId = req.params.userId;
  
      if (!project) return res.status(404).json({ message: 'Проект не найден' });
  
      project.users = project.users.filter(id => id.toString() !== userId);
      await project.save();
  
      const updated = await Project.findById(req.params.id).populate('users', '-password');
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Ошибка удаления пользователя', error: err.message });
    }
  };
  
  exports.deleteProject = async (req, res) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);
  
      if (!project) {
        return res.status(404).json({ message: 'Проект не найден' });
      }
  
      res.json({ message: 'Проект удалён успешно' });
    } catch (err) {
      res.status(500).json({ message: 'Ошибка удаления проекта', error: err.message });
    }
  };

const Project = require('../models/Project');
const User = require('../models/User');

exports.addUserToProject = async (req, res) => {
  const { userId } = req.body;
  const projectId = req.params.id;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Проект не найден' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (project.users.includes(userId)) {
      return res.status(400).json({ message: 'Пользователь уже в проекте' });
    }

    project.users.push(userId);
    await project.save();

    res.status(200).json({ message: 'Пользователь добавлен в проект' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка добавления пользователя', error: err.message });
  }
};

const Board = require('../models/Board');
const Note = require('../models/Note');

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Проект не найден' });

    await Board.deleteMany({ _id: { $in: project.boards } });

    await Note.deleteMany({ _id: { $in: project.notes } });

    await project.deleteOne();

    res.json({ message: 'Проект и все связанные доски и заметки удалены' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления проекта', error: err.message });
  }
};
