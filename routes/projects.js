const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addUserToProject, // Возможно, оставим, но основной способ добавления будет через invitations
  removeUserFromProject,
  changeUserRoleInProject, // Новый роут
  getBoardsByProject,
  getNotesByProject,
} = require('../controllers/projectController');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const Project = require('../models/Project');

// Все маршруты — защищённые
router.use(auth);

// POST /api/projects
router.post('/', createProject);

// GET /api/projects/:id
router.get('/:id', getProjectById);

// PUT /api/projects/:id
router.put('/:id', updateProject);

// DELETE /api/projects/:id
router.delete('/:id', deleteProject);

// POST /api/projects/:id/users - Добавить пользователя
router.post('/:id/users', addUserToProject);

// DELETE /api/projects/:id/users/:userId - Удалить пользователя из проекта
router.delete('/:id/users/:userId', removeUserFromProject);

// PUT /api/projects/:id/users/:userId/role - Изменить роль пользователя в проекте
router.put('/:id/users/:userId/role', changeUserRoleInProject);


// GET /api/projects/:id/boards
router.get('/:id/boards', getBoardsByProject);

// POST /api/projects/:id/boards (создание доски для проекта)
const { createBoard } = require('../controllers/boardController');
router.post('/:id/boards', createBoard);

// GET /api/projects/:id/notes
router.get('/:id/notes', getNotesByProject);

// Загрузка изображения проекта
router.put('/:id/image', upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const currentUserInProject = project.users.find(u => u.userId.equals(req.user.id));
    if (!currentUserInProject || (currentUserInProject.role !== 'owner' && currentUserInProject.role !== 'admin')) {
      return res.status(403).json({ message: 'Только владелец или администратор может загружать изображения проекта' });
    }

    project.imageUrl = `/uploads/${req.file.filename}`;
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка загрузки изображения проекта', error: err.message });
  }
});

module.exports = router;