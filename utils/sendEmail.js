const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //Создаем инструмент для отправки email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true для 465, false для других портов
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //Определяем параметры email
  const mailOptions = {
    from: `Your App <${process.env.EMAIL_USER}>`, // Отправитель
    to: options.email,        // Получатель
    subject: options.subject, // Тема
    html: options.message,    // HTML-содержимое
    text: options.text,       // Текстовое содержимое (для резерва)
  };

  //Отправляем email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;