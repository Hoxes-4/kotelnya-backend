const Project = require('../models/Project');
const User = require('../models/User');
const Board = require('../models/Board');
const Note = require('../models/Note');
const mongoose = require('mongoose');

const populateProject = (query) => {
  return query
    .populate({
      path: 'users.userId',
      model: 'User',
      select: 'username email avatarUrl',
    })
    .populate('boards')
    .populate('notes');
};


exports.createProject = async (req, res) => {
  const { title, status } = req.body;
  try {
    let newProject = new Project({
      title,
      status: status || 'В процессе',
      users: [{ userId: req.user.id, role: 'owner' }],
    });
    await newProject.save();

    newProject = await populateProject(Project.findById(newProject._id)).lean();

    res.status(201).json(newProject);
  } catch (err) {
    console.error("Ошибка при создании проекта:", err);
    res.status(500).json({ message: 'Ошибка при создании проекта', error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await populateProject(Project.findById(req.params.id));

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const isMember = project.users.some(userEntry =>
      userEntry.userId && userEntry.userId._id.equals(req.user.id) 
    );
    if (!isMember) {
      return res.status(403).json({ message: 'У вас нет доступа к этому проекту' });
    }

    res.json(project);
  } catch (err) {
    console.error("Ошибка получения проекта:", err);
    res.status(500).json({ message: 'Ошибка получения проекта', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const updates = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const currentUserRole = project.users.find(u => u.userId.equals(req.user.id));
    if (!currentUserRole || (currentUserRole.role !== 'owner' && currentUserRole.role !== 'admin')) {
      return res.status(403).json({ message: 'Только владелец или администратор может обновлять проект' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updates,
      { new: true, runValidators: true }
    );

    const populatedProject = await populateProject(Project.findById(updatedProject._id)).lean();

    res.json(populatedProject);
  } catch (err) {
    console.error("Ошибка обновления проекта:", err);
    res.status(500).json({ message: 'Ошибка обновления проекта', error: err.message });
  }
};

exports.addUserToProject = async (req, res) => {
  const { userId, role = 'member' } = req.body;
  const projectId = req.params.id;

  try {
    let project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Проект не найден' });

    const currentUserRole = project.users.find(u => u.userId.equals(req.user.id));
    if (!currentUserRole || (currentUserRole.role !== 'owner' && currentUserRole.role !== 'admin')) {
      return res.status(403).json({ message: 'У вас нет прав для добавления пользователей в этот проект' });
    }

    const userToAdd = await User.findById(userId);
    if (!userToAdd) return res.status(404).json({ message: 'Пользователь для добавления не найден' });

    if (project.users.some(u => u.userId && u.userId.equals(userId))) {
      return res.status(400).json({ message: 'Пользователь уже является участником проекта' });
    }


    project.users.push({ userId: userToAdd._id, role: role });
    await project.save();

    project = await populateProject(Project.findById(projectId)).lean();

    res.status(200).json({ message: 'Пользователь успешно добавлен в проект', project });
  } catch (err) {
    console.error("Ошибка добавления пользователя в проект:", err);
    res.status(500).json({ message: 'Ошибка добавления пользователя', error: err.message });
  }
};

exports.removeUserFromProject = async (req, res) => {
  const { id: projectId, userId } = req.params;

  try {
    let project = await Project.findById(projectId);
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

    project = await populateProject(Project.findById(projectId)).lean();

    res.status(200).json({ message: 'Пользователь успешно удален из проекта', project });
  } catch (err) {
    console.error("Ошибка удаления пользователя из проекта:", err);
    res.status(500).json({ message: 'Ошибка удаления пользователя из проекта', error: err.message });
  }
};


exports.changeUserRoleInProject = async (req, res) => {
  const { newRole } = req.body;
  const { id: projectId, userId: targetUserId } = req.params;

  const allowedRoles = ['owner', 'admin', 'member'];
  if (!allowedRoles.includes(newRole)) {
    return res.status(400).json({ message: 'Недопустимая роль. Допустимые роли: owner, admin, member.' });
  }

  try {
    let project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const currentUserInProject = project.users.find(u => u.userId.equals(req.user.id));
    if (!currentUserInProject || currentUserInProject.role !== 'owner') {
      return res.status(403).json({ message: 'Только владелец может изменить роль пользователя' });
    }

    const targetUserEntry = project.users.find(u => u.userId.equals(targetUserId));
    if (!targetUserEntry) {
      return res.status(404).json({ message: 'Пользователь не найден в проекте' });
    }

    if (targetUserEntry.userId.equals(req.user.id) && newRole !== 'owner') {
      return res.status(400).json({ message: 'Владелец не может изменить свою роль на не-владельца напрямую.' });
    }

    // Если текущий владелец пытается передать владение другому
    if (newRole === 'owner' && !targetUserEntry.userId.equals(req.user.id)) {
        return res.status(400).json({ message: 'Передача владения проектом пока не поддерживается.' });
    }

    targetUserEntry.role = newRole;
    await project.save();

    project = await populateProject(Project.findById(projectId)).lean();

    res.json({ message: `Роль пользователя успешно изменена на ${newRole}`, project });
  } catch (err) {
    console.error("Ошибка при изменении роли пользователя в проекте:", err);
    res.status(500).json({ message: 'Ошибка изменения роли пользователя', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const isOwner = project.users.some(userEntry => userEntry.userId.equals(req.user.id) && userEntry.role === 'owner');
    if (!isOwner) {
      return res.status(403).json({ message: 'Только владелец может удалить проект' });
    }

    await Board.deleteMany({ _id: { $in: project.boards } });
    await Note.deleteMany({ _id: { $in: project.notes } });

    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Проект успешно удален' });
  } catch (err) {
    console.error("Ошибка при удалении проекта:", err);
    res.status(500).json({ message: 'Ошибка при удалении проекта', error: err.message });
  }
};
