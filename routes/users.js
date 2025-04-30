const express = require('express');
const router = express.Router();
const { getUserById, updateUser, deleteUser } = require('../controllers/userController');

// Получить пользователя по ID
// GET /api/users/:id
router.get('/:id', getUserById);

// Обновить пользователя
// PUT /api/users/:id
router.put('/:id', updateUser);

// Удалить пользователя
// DELETE /api/users/:id
router.delete('/:id', deleteUser);

module.exports = router;

const { getUserProjects } = require('../controllers/userController');

// GET /api/users/:id/projects
router.get('/:id/projects', getUserProjects);