const User = require('../models/User');
const Project = require('../models/Project');

exports.sendInvitation = async (req, res) => {
  const { projectId, userId } = req.body; // userId - это ID пользователя, которого приглашают
  const invitedById = req.user.id; // Текущий аутентифицированный пользователь, который отправляет приглашение

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const isProjectAdmin = project.users.some(user => user.userId.equals(invitedById) && (user.role === 'admin' || user.role === 'owner'));
    if (!isProjectAdmin) {
      return res.status(403).json({ message: 'Только администратор или владелец может приглашать пользователей в проект' });
    }


    const invitedUser = await User.findById(userId);
    if (!invitedUser) {
      return res.status(404).json({ message: 'Приглашаемый пользователь не найден' });
    }

    const isAlreadyMember = project.users.some(user => user.userId.equals(userId));
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'Пользователь уже является участником этого проекта' });
    }

    const existingInvitation = invitedUser.projectInvitations.find(
      inv => inv.projectId.equals(projectId) && inv.status === 'pending'
    );
    if (existingInvitation) {
      return res.status(400).json({ message: 'Приглашение этому пользователю в этот проект уже было отправлено' });
    }

    invitedUser.projectInvitations.push({
      projectId: project._id,
      projectName: project.title,
      invitedBy: invitedById,
      status: 'pending',
    });
    await invitedUser.save();

    res.status(200).json({ message: 'Приглашение успешно отправлено', invitation: invitedUser.projectInvitations.slice(-1)[0] });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при отправке приглашения', error: error.message });
  }
};

exports.getInvitations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('projectInvitations');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.status(200).json(user.projectInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении приглашений', error: error.message });
  }
};

exports.acceptInvitation = async (req, res) => {
  const { invitationId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const invitation = user.projectInvitations.id(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Приглашение не найдено' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Приглашение уже было обработано' });
    }

    const project = await Project.findById(invitation.projectId);
    if (!project) {
      invitation.remove();
      await user.save();
      return res.status(404).json({ message: 'Проект, к которому относится приглашение, не найден. Приглашение удалено.' });
    }

    const isAlreadyMember = project.users.some(u => u.userId.equals(userId));
    if (!isAlreadyMember) {
      project.users.push({ userId: userId, role: 'member' }); // Роль по умолчанию 'member'
      await project.save();
    }

    invitation.status = 'accepted';
    await user.save();

    res.status(200).json({ message: 'Приглашение принято. Вы успешно присоединены к проекту.', project });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при принятии приглашения', error: error.message });
  }
};

exports.rejectInvitation = async (req, res) => {
  const { invitationId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const invitation = user.projectInvitations.id(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Приглашение не найдено' });
    }
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Приглашение уже было обработано' });
    }

    invitation.status = 'rejected';
    await user.save();

    res.status(200).json({ message: 'Приглашение отклонено.' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при отклонении приглашения', error: error.message });
  }
};

exports.deleteInvitation = async (req, res) => {
  const { invitationId } = req.params;
  const invitedById = req.user.id; // Тот, кто отправлял или владелец/админ проекта

  try {
    const user = await User.findOne({ 'projectInvitations._id': invitationId });
    if (!user) {
      return res.status(404).json({ message: 'Приглашение не найдено' });
    }

    const invitation = user.projectInvitations.id(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Приглашение не найдено' });
    }

    const project = await Project.findById(invitation.projectId);
    const isProjectAdminOrOwner = project && project.users.some(u => u.userId.equals(invitedById) && (u.role === 'admin' || u.role === 'owner'));

    if (!invitation.invitedBy.equals(invitedById) && !isProjectAdminOrOwner) {
      return res.status(403).json({ message: 'У вас нет прав для удаления этого приглашения' });
    }

    invitation.remove();
    await user.save();

    res.status(200).json({ message: 'Приглашение успешно удалено.' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении приглашения', error: error.message });
  }
};