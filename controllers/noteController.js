const Note = require('../models/Note');
const Project = require('../models/Project');

// 📥 Создать заметку и добавить в проект
exports.createNote = async (req, res) => {
  try {
    const { title, markdownContent } = req.body;

    const note = await Note.create({
      title,
      markdownContent,
      author: req.user._id,
    });

    await Project.findByIdAndUpdate(req.params.id, {
      $push: { notes: note._id }
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка создания заметки', error: err.message });
  }
};

// 📤 Получить заметку по ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('author', '-password');

    if (!note) {
      return res.status(404).json({ message: 'Заметка не найдена' });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения заметки', error: err.message });
  }
};

// ✏️ Обновить заметку
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Заметка не найдена' });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления заметки', error: err.message });
  }
};

// 🗑 Удалить заметку
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Заметка не найдена' });
    }

    res.json({ message: 'Заметка удалена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления заметки', error: err.message });
  }
};
