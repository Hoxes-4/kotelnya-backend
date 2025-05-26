const User = require('../models/User');

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка получения пользователя', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка обновления профиля', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ message: 'Пользователь успешно удалён' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка удаления пользователя', error: error.message });
  }
};

const Project = require('../models/Project');
const Note = require('../models/Note');

exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.params.id;

    const projects = await Project.find({ users: userId })
      .populate('users', '-password')
      .populate('boards')
      .populate('notes');

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения проектов пользователя', error: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const regex = new RegExp(query, 'i'); // i = ignore case
    const users = await User.find({
      $or: [{ username: regex }, { email: regex }],
    }).select('-password'); // не возвращаем пароль

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка поиска пользователей', error: err.message });
  }
};