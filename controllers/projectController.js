const Project = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const { title, users } = req.body;

    const project = await Project.create({
      title,
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

exports.addUserToProject = async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      const userId = req.body.userId;
  
      if (!project) return res.status(404).json({ message: 'Проект не найден' });
  
      if (!project.users.includes(userId)) {
        project.users.push(userId);
        await project.save();
      }
  
      const updated = await Project.findById(req.params.id).populate('users', '-password');
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Ошибка добавления пользователя', error: err.message });
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