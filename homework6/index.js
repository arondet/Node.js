import express from 'express';
import pool from './db.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Данные не отправлены' });
  }
  res.json({ message: 'Данные получены', data: req.body });
});

app.get('/products', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/products', async (req, res, next) => {
  try {
    const { name, price } = req.body || {};
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Нужны поля name и price' });
    }
    await pool.query('INSERT INTO products (name, price) VALUES (?, ?)', [name, price]);
    res.status(201).json({ message: 'Продукт успешно добавлен' });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
