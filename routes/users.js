const express = require('express');
const router = express.Router();
const { getUserById, updateUser, deleteUser } = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');
router.use(auth);

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

const { searchUsers } = require('../controllers/userController');

// GET /api/users/search?query=...
router.get('/search', searchUsers);