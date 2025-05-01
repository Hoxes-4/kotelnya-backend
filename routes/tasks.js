const express = require('express');
const router = express.Router();
const {
  createTask,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

// POST /api/boards/:boardId/tasks
router.post('/boards/:boardId/tasks', createTask);

// GET /api/tasks/:id
router.get('/tasks/:id', getTaskById);

// PUT /api/tasks/:id
router.put('/tasks/:id', updateTask);

// DELETE /api/tasks/:id
router.delete('/tasks/:id', deleteTask);

module.exports = router;
