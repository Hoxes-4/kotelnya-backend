// routes/invitations.js
const express = require('express');
const router = express.Router();
const {
  sendInvitation,
  getInvitations,
  acceptInvitation,
  rejectInvitation,
  deleteInvitation,
} = require('../controllers/invitationController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

// POST /api/invitations/send - Отправить приглашение в проект
router.post('/send', sendInvitation);

// GET /api/invitations - Получить все приглашения текущего пользователя
router.get('/', getInvitations);

// POST /api/invitations/accept - Принять приглашение
router.post('/accept', acceptInvitation);

// POST /api/invitations/reject - Отклонить приглашение
router.post('/reject', rejectInvitation);

// DELETE /api/invitations/:invitationId - Удалить приглашение (отправителем или админом/владельцем)
router.delete('/:invitationId', deleteInvitation);

module.exports = router;