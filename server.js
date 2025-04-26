const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB подключена');
    app.listen(PORT, () => {
      console.log(`🚀 Сервер работает на http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Ошибка MongoDB:', err.message);
  });