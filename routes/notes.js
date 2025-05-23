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

const upload = require('../middlewares/uploadMiddleware');

router.put('/:id/image', auth, upload.single('image'), async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { imageUrl: `/uploads/${req.file.filename}` },
      { new: true }
    );

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка загрузки изображения в заметку', error: err.message });
  }
});

module.exports = router;
