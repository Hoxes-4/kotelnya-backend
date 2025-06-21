const express = require('express');
const router = express.Router();
const { createProject, getProjectById } = require('../controllers/projectController');
const auth = require('../middlewares/authMiddleware');
const Project = require('../models/Project');

// Все маршруты — защищённые
router.use(auth);

// POST /api/projects
router.post('/', createProject);

// GET /api/projects/:id
router.get('/:id', getProjectById);

const { updateProject } = require('../controllers/projectController');

// PUT /api/projects/:id
router.put('/:id', updateProject);

const {
    addUserToProject,
    removeUserFromProject,
    changeUserRoleInProject,
  } = require('../controllers/projectController');
  
  // POST /api/projects/:id/users
  router.post('/:id/users', addUserToProject);
  
  // DELETE /api/projects/:id/users/:userId
  router.delete('/:id/users/:userId', removeUserFromProject);

  // PUT /api/projects/:id/users/:userId/role
  router.put('/:id/users/:userId/role', changeUserRoleInProject);

const { deleteProject } = require('../controllers/projectController');

// DELETE /api/projects/:id
router.delete('/:id', deleteProject);


const { createBoard, getBoardsByProject} = require('../controllers/boardController');

// GET /api/projects/:id/boards
router.get('/:id/boards', getBoardsByProject);

// POST /api/projects/:id/boards
router.post('/:id/boards', createBoard);

const { createNote, getNotesByProject } = require('../controllers/noteController');

// GET /api/projects/:id/notes
router.get('/:id/notes', getNotesByProject);

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/:id/users', authMiddleware, addUserToProject);

const upload = require('../middlewares/uploadMiddleware');

router.put('/:id/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { imageUrl: `/uploads/${req.file.filename}` },
      { new: true }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка загрузки изображения проекта', error: err.message });
  }
});

module.exports = router;