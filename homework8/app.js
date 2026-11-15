import express from 'express';
import Book from './models/book.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/books', async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/books', async (req, res) => {
  try {
    const { title, author, year } = req.body || {};
    if (!title || !author || year === undefined) {
      return res.status(400).json({ error: 'Нужны поля title, author и year' });
    }
    const book = await Book.create({ title, author, year });
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.put('/books/:id', async (req, res) => {
  try {
    const { title, author, year } = req.body || {};
    const [updated] = await Book.update(
      { title, author, year },
      { where: { id: req.params.id } }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    res.json({ message: 'Книга обновлена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    const deleted = await Book.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    res.json({ message: 'Книга удалена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
