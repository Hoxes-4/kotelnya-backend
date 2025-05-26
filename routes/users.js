const express = require('express');
const router = express.Router();
const { getUserById, updateUser, deleteUser,searchUsers } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');
router.use(auth);

// GET /api/users/search?query=...
router.get('/search', searchUsers);

// GET /api/users/:id
router.get('/:id', getUserById);

// PUT /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

module.exports = router;

const { getUserProjects } = require('../controllers/userController');

// GET /api/users/:id/projects
router.get('/:id/projects', getUserProjects);

const upload = require('../middlewares/uploadMiddleware');

router.put('/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatarUrl: `/uploads/${req.file.filename}` },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка загрузки аватара', error: err.message });
  }
});