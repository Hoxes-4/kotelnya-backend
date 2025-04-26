const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
app.use(express.json());

app.use('/api/boards', require('./routes/boards'));

app.get('/', (req, res) => {
    res.send('✅ Сервер работает! Добро пожаловать в API');
  });
  
module.exports = app;