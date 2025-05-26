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