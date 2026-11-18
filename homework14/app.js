import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from './models/Category.js';
import Product from './models/Product.js';

// Загружаем переменные окружения из файла .env
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---------- Подключение к MongoDB ----------

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

// ---------- Маршруты ----------

// POST /categories — добавить новую категорию
app.post('/categories', async (req, res) => {
  try {
    const category = await Category.create({ name: req.body.name });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create category', error: err.message });
  }
});

// POST /products — добавить новый продукт (category — ObjectId категории)
app.post('/products', async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (category !== undefined) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
      if (!(await Category.exists({ _id: category }))) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }

    const product = await Product.create({ name, price, category });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create product', error: err.message });
  }
});

// GET /products — все продукты с полной информацией о категориях
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get products', error: err.message });
  }
});

// ---------- Запуск ----------

// Сервер запускается только после успешного подключения к базе данных
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
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
