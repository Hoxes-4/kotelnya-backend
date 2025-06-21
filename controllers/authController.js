const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // токен живёт 7 дней
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким именем или почтой уже существует' });
    }

    const user = await User.create({ username, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка регистрации', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const token = generateToken(user._id);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка входа', error: error.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Находим пользователя по email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь с таким email не найден' });
    }

    // Генерируем токен сброса пароля
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false }); // Сохраняем пользователя с токеном

    // Создаем URL для сброса пароля
    // process.env.CLIENT_URL - это URL фронтенда
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>Вы запросили сброс пароля</h1>
      <p>Перейдите по этой ссылке, чтобы сбросить свой пароль:</p>
      <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
      <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
      <p>Срок действия ссылки истекает через 1 час.</p>
    `;

    try {
      // Отправляем email
      await sendEmail({
        email: user.email,
        subject: 'Сброс пароля для вашего аккаунта',
        message: message,
        text: `Ссылка для сброса пароля: ${resetUrl}`,
      });

      res.status(200).json({ message: 'Ссылка для сброса пароля отправлена на ваш email' });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("Ошибка отправки email:", err);
      return res.status(500).json({ message: 'Ошибка при отправке email для сброса пароля', error: err.message });
    }
  } catch (err) {
    console.error("Ошибка в forgotPassword:", err);
    res.status(500).json({ message: 'Ошибка запроса на сброс пароля', error: err.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Получаем хэшированный токен из URL (токен в URL - нехэшированный, но в БД - хэшированный)
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token) // Токен из URL
      .digest('hex');

    // Находим пользователя по токену и проверяем срок действия
    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Неверный или просроченный токен сброса пароля' });
    }

    // Устанавливаем новый пароль
    user.password = req.body.password; // Новый пароль придет из тела запроса
    user.passwordResetToken = undefined; // Очищаем токен
    user.passwordResetExpires = undefined; // Очищаем срок действия

    await user.save(); // Автоматически хэширует новый пароль благодаря userSchema.pre('save')

    // Генерируем новый JWT токен для пользователя
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Пароль успешно сброшен',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (err) {
    console.error("Ошибка в resetPassword:", err);
    res.status(500).json({ message: 'Ошибка сброса пароля', error: err.message });
  }
};