const express = require('express');
const router = express.Router();
const {
  getBoardById,
  updateBoard,
  deleteBoard
} = require('../controllers/boardController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

// GET /api/boards/:id
router.get('/:id', getBoardById);

// PUT /api/boards/:id
router.put('/:id', updateBoard);

// DELETE /api/boards/:id
router.delete('/:id', deleteBoard);

module.exports = router;
