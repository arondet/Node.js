import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Publisher, Magazine, Tag, Article } from './models/index.js';

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

// Строка подключения к MongoDB (берётся из .env)
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());

// ---------- Управление подключением ----------

mongoose.connection.on('connected', () => {
  console.log('Mongoose: connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose: connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose: disconnected from MongoDB');
});

// ---------- Простой маршрут ----------

app.get('/', (req, res) => {
  res.send('Homework 13: Express + Mongoose');
});

// ---------- Задание 2: Publisher и Magazine (один ко многим) ----------

// Создать издателя
app.post('/publishers', async (req, res) => {
  try {
    const publisher = await Publisher.create(req.body);
    res.status(201).json(publisher);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create publisher', error: err.message });
  }
});

// Все издатели
app.get('/publishers', async (req, res) => {
  try {
    res.json(await Publisher.find());
  } catch (err) {
    res.status(500).json({ message: 'Failed to get publishers', error: err.message });
  }
});

// Журналы конкретного издателя
app.get('/publishers/:id/magazines', async (req, res) => {
  try {
    const magazines = await Magazine.find({ publisher: req.params.id });
    res.json(magazines);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get magazines', error: err.message });
  }
});

// Создать журнал (в теле передаём id издателя в поле publisher)
app.post('/magazines', async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.body.publisher);
    if (!publisher) return res.status(404).json({ message: 'Publisher not found' });

    const magazine = await Magazine.create(req.body);
    res.status(201).json(magazine);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create magazine', error: err.message });
  }
});

// Все журналы вместе с данными издателя (populate)
app.get('/magazines', async (req, res) => {
  try {
    res.json(await Magazine.find().populate('publisher'));
  } catch (err) {
    res.status(500).json({ message: 'Failed to get magazines', error: err.message });
  }
});

// ---------- Задание 3: Tag и Article (многие ко многим) ----------

// Создать тег
app.post('/tags', async (req, res) => {
  try {
    const tag = await Tag.create({ name: req.body.name });
    res.status(201).json(tag);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create tag', error: err.message });
  }
});

// Все теги вместе со статьями
app.get('/tags', async (req, res) => {
  try {
    res.json(await Tag.find().populate('articles', 'title'));
  } catch (err) {
    res.status(500).json({ message: 'Failed to get tags', error: err.message });
  }
});

// Создать статью (в теле передаём массив id тегов в поле tags)
app.post('/articles', async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;

    const foundTags = await Tag.countDocuments({ _id: { $in: tags } });
    if (foundTags !== tags.length) return res.status(404).json({ message: 'Some tags not found' });

    const article = await Article.create({ title, content, tags });

    // Связь в обе стороны: добавляем статью в каждый её тег
    await Tag.updateMany({ _id: { $in: tags } }, { $addToSet: { articles: article._id } });

    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create article', error: err.message });
  }
});

// Все статьи вместе с тегами
app.get('/articles', async (req, res) => {
  try {
    res.json(await Article.find().populate('tags', 'name'));
  } catch (err) {
    res.status(500).json({ message: 'Failed to get articles', error: err.message });
  }
});

// ---------- Запуск ----------

// Сервер запускается только после успешного подключения к базе данных
async function start() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Successfully connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();
