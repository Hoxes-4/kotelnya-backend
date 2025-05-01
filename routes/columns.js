const express = require('express');
const router = express.Router();
const {
  createColumn,
  getColumnById,
  updateColumn,
  deleteColumn
} = require('../controllers/columnController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

// POST /api/boards/:boardId/columns
router.post('/boards/:boardId/columns', createColumn);

// GET /api/columns/:id
router.get('/columns/:id', getColumnById);

// PUT /api/columns/:id
router.put('/columns/:id', updateColumn);

// DELETE /api/columns/:id
router.delete('/columns/:id', deleteColumn);

module.exports = router;
