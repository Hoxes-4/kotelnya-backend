const express = require('express');
const router = express.Router();
const { createProject, getProjectById } = require('../controllers/projectController');
const auth = require('../middlewares/authMiddleware');

// Все маршруты — защищённые
router.use(auth);

// POST /api/projects
router.post('/', createProject);

// GET /api/projects/:id
router.get('/:id', getProjectById);

module.exports = router;

const { updateProject } = require('../controllers/projectController');

// PUT /api/projects/:id
router.put('/:id', updateProject);

const {
    addUserToProject,
    removeUserFromProject,
  } = require('../controllers/projectController');
  
  // POST /api/projects/:id/users
  router.post('/:id/users', addUserToProject);
  
  // DELETE /api/projects/:id/users/:userId
  router.delete('/:id/users/:userId', removeUserFromProject);
  

const { deleteProject } = require('../controllers/projectController');

// DELETE /api/projects/:id
router.delete('/:id', deleteProject);


const { createBoard, getBoardsByProject, getNotesByProject } = require('../controllers/boardController');

// GET /api/projects/:id/boards
router.get('/:id/boards', getBoardsByProject);

// POST /api/projects/:id/boards
router.post('/:id/boards', createBoard);

// GET /api/projects/:id/notes
router.get('/:id/notes', getNotesByProject);

const { addUserToProject } = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/:id/users', authMiddleware, addUserToProject);