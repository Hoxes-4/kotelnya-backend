const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Middleware: проверка токена
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Проверка заголовка
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет токена' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Неверный или истёкший токен' });
  }
};
