const express = require('express');
const router = express.Router();
const {
  createNote,
  getNoteById,
  updateNote,
  deleteNote
} = require('../controllers/noteController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

// POST /api/projects/:id/notes
router.post('/projects/:id/notes', createNote);

// GET /api/notes/:id
router.get('/notes/:id', getNoteById);

// PUT /api/notes/:id
router.put('/notes/:id', updateNote);

// DELETE /api/notes/:id
router.delete('/notes/:id', deleteNote);

module.exports = router;
