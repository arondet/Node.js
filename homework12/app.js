import express from 'express';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import { connectDB, getDB } from './db/index.js';

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Коллекция products
const products = () => getDB().collection('products');

// Проверка данных продукта (name, price, description)
// partial = true — для PUT, когда можно передать только часть полей
function validateProduct(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object';
  }

  const { name, price, description } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return 'Field "name" is required and must be a non-empty string';
    }
  }

  if (!partial || price !== undefined) {
    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      return 'Field "price" is required and must be a number >= 0';
    }
  }

  if (description !== undefined && typeof description !== 'string') {
    return 'Field "description" must be a string';
  }

  if (partial && name === undefined && price === undefined && description === undefined) {
    return 'Provide at least one field to update: name, price or description';
  }

  return null;
}

// Проверка ID
function isValidId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

// POST /products — создать новый продукт
app.post('/products', async (req, res) => {
  try {
    const error = validateProduct(req.body);
    if (error) return res.status(400).json({ message: error });

    const { name, price, description = '' } = req.body;
    const newProduct = { name: name.trim(), price, description };

    const result = await products().insertOne(newProduct);
    res.status(201).json({ _id: result.insertedId, ...newProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
});

// GET /products — получить все продукты
app.get('/products', async (req, res) => {
  try {
    const list = await products().find().toArray();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get products', error: err.message });
  }
});

// GET /products/:id — получить продукт по ID
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const product = await products().findOne({ _id: new ObjectId(id) });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get product', error: err.message });
  }
});

// PUT /products/:id — обновить продукт
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const error = validateProduct(req.body, true);
    if (error) return res.status(400).json({ message: error });

    const { name, price, description } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (price !== undefined) update.price = price;
    if (description !== undefined) update.description = description;

    const updated = await products().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
});

// DELETE /products/:id — удалить продукт
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const result = await products().deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted', _id: id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
});

// Обработка некорректного JSON в теле запроса и других ошибок
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Сервер запускается только после успешного подключения к базе данных
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();
