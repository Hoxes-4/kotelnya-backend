const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();

const cors = require('cors');
app.use(cors());


dotenv.config();
app.use(express.json());

app.use('/api/boards', require('./routes/boards'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api', require('./routes/tasks'));
app.use('/api', require('./routes/columns'));
app.use('/api', require('./routes/notes'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('✅ Сервер работает! Добро пожаловать в API');
  });
  
module.exports = app;