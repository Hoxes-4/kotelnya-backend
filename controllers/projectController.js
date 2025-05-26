const Project = require('../models/Project');
const User = require('../models/User');
const Board = require('../models/Board');
const Note = require('../models/Note');
const mongoose = require('mongoose');

exports.createProject = async (req, res) => {
  const { title } = req.body;
  try {
    const newProject = new Project({
      title,
      users: [{ userId: req.user.id, role: 'owner' }],
    });
    await newProject.save();

    const user = await User.findById(req.user.id);
    if (user) {
    }
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при создании проекта', error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('users.userId', 'username email avatarUrl')
      .populate('boards')
      .populate('notes');

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const isMember = project.users.some(user => user.userId._id.equals(req.user.id));
    if (!isMember) {
      return res.status(403).json({ message: 'У вас нет доступа к этому проекту' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении проекта', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  const { title, status, imageUrl } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const currentUserInProject = project.users.find(u => u.userId.equals(req.user.id));
    if (!currentUserInProject || (currentUserInProject.role !== 'owner' && currentUserInProject.role !== 'admin')) {
      return res.status(403).json({ message: 'Только владелец или администратор может обновить проект' });
    }

    project.title = title || project.title;
    project.status = status || project.status;
    project.imageUrl = imageUrl || project.imageUrl;

    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении проекта', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const isOwner = project.users.some(user => user.userId.equals(req.user.id) && user.role === 'owner');
    if (!isOwner) {
      return res.status(403).json({ message: 'Только владелец может удалить проект' });
    }

    await Board.deleteMany({ _id: { $in: project.boards } });
    await Note.deleteMany({ _id: { $in: project.notes } });

    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Проект успешно удален' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при удалении проекта', error: err.message });
  }
};

exports.addUserToProject = async (req, res) => {
    const { userId, role } = req.body; // userId - это ID пользователя, которого добавляют
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Проект не найден' });
        }

        const currentUserInProject = project.users.find(u => u.userId.equals(req.user.id));
        if (!currentUserInProject || (currentUserInProject.role !== 'owner' && currentUserInProject.role !== 'admin')) {
            return res.status(403).json({ message: 'Только владелец или администратор может добавлять пользователей в проект' });
        }

        const isAlreadyMember = project.users.some(user => user.userId.equals(userId));
        if (isAlreadyMember) {
            return res.status(400).json({ message: 'Пользователь уже является участником этого проекта' });
        }

        project.users.push({ userId, role: role || 'member' });
        await project.save();

        res.status(200).json(project);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при добавлении пользователя в проект', error: err.message });
    }
};

exports.changeUserRoleInProject = async (req, res) => {
  const { userId, newRole } = req.body; // userId - ID пользователя, чью роль меняем
  const projectId = req.params.id;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const currentUserInProject = project.users.find(u => u.userId.equals(req.user.id));
    if (!currentUserInProject || currentUserInProject.role !== 'owner') {
      return res.status(403).json({ message: 'Только владелец может изменять роли пользователей в проекте' });
    }

    const targetUserInProject = project.users.find(u => u.userId.equals(userId));
    if (!targetUserInProject) {
      return res.status(404).json({ message: 'Пользователь не является участником этого проекта' });
    }

    if (targetUserInProject.userId.equals(req.user.id)) {
      return res.status(400).json({ message: 'Вы не можете изменить свою собственную роль.' });
    }

    if (targetUserInProject.role === 'owner') {
      return res.status(400).json({ message: 'Невозможно изменить роль другого владельца.' });
    }

    const validRoles = ['admin', 'member'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Недопустимая роль. Допустимые роли: admin, member.' });
    }

    targetUserInProject.role = newRole;
    await project.save();

    res.status(200).json({ message: `Роль пользователя успешно изменена на ${newRole}`, project });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при изменении роли пользователя', error: error.message });
  }
};

exports.removeUserFromProject = async (req, res) => {
    const { userId } = req.params; // userId - это ID пользователя, которого удаляют
    const projectId = req.params.id;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Проект не найден' });
        }

        const currentUserInProject = project.users.find(u => u.userId.equals(req.user.id));
        if (!currentUserInProject || (currentUserInProject.role !== 'owner' && currentUserInProject.role !== 'admin')) {
            return res.status(403).json({ message: 'У вас нет прав для удаления пользователей из этого проекта' });
        }

        const userToRemove = project.users.find(u => u.userId.equals(userId));
        if (!userToRemove) {
            return res.status(404).json({ message: 'Пользователь не является участником этого проекта' });
        }

        if (userToRemove.userId.equals(req.user.id) && userToRemove.role === 'owner') {
            return res.status(400).json({ message: 'Владелец не может удалить самого себя из проекта.' });
        }

        if (currentUserInProject.role === 'admin' && (userToRemove.role === 'owner' || userToRemove.role === 'admin')) {
            return res.status(403).json({ message: 'Администратор не может удалить владельца или другого администратора.' });
        }

        project.users = project.users.filter(u => !u.userId.equals(userId));
        await project.save();

        const removedUser = await User.findById(userId);
        if (removedUser) {
            // removedUser.projects = removedUser.projects.filter(pId => !pId.equals(projectId));
            // await removedUser.save();
        }

        res.status(200).json({ message: 'Пользователь успешно удален из проекта.', project });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении пользователя из проекта', error: err.message });
    }
};