const BoardColumn = require('../models/BoardColumn');
const Board = require('../models/Board');

exports.createColumn = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const column = await BoardColumn.create(req.body);

    await Board.findByIdAndUpdate(boardId, {
      $push: { columns: column._id, columnOrder: column._id.toString() }
    });

    res.status(201).json(column);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка создания колонки', error: err.message });
  }
};

exports.getColumnById = async (req, res) => {
  try {
    const column = await BoardColumn.findById(req.params.id).populate('tasks');

    if (!column) {
      return res.status(404).json({ message: 'Колонка не найдена' });
    }

    res.json(column);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка получения колонки', error: err.message });
  }
};

exports.updateColumn = async (req, res) => {
  try {
    const column = await BoardColumn.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!column) {
      return res.status(404).json({ message: 'Колонка не найдена' });
    }

    res.json(column);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления колонки', error: err.message });
  }
};

exports.deleteColumn = async (req, res) => {
  try {
    const columnId = req.params.id;

    const deletedColumn = await BoardColumn.findByIdAndDelete(columnId);
    if (!deletedColumn) {
      return res.status(404).json({ message: 'Колонка не найдена' });
    }

    await Board.updateMany(
      { columns: columnId },
      {
        $pull: {
          columns: columnId,
          columnOrder: columnId.toString(),
        },
      }
    );

    res.json({ message: 'Колонка и все ссылки удалены' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления колонки', error: err.message });
  }
};
