import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sequelize from './db.js';
import User from './models/user.js';
import {
  SECRET,
  authenticate,
  checkPasswordChange,
  requireAdmin,
} from './middleware/auth.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Нужны email и password' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email уже зарегистрирован' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
    const response = { token };
    if (user.mustChangePassword) {
      response.redirect = '/change-password';
    }
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/change-password', authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword) {
      return res.status(400).json({ error: 'Нужен newPassword' });
    }
    req.user.password = await bcrypt.hash(newPassword, 10);
    req.user.mustChangePassword = false;
    await req.user.save();
    res.json({ message: 'Пароль изменён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/delete-account', authenticate, checkPasswordChange, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password || !(await bcrypt.compare(password, req.user.password))) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    await req.user.destroy();
    res.json({ message: 'Аккаунт удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/admin', authenticate, checkPasswordChange, requireAdmin, (req, res) => {
  res.json({ message: 'Добро пожаловать, администратор' });
});

app.post('/change-email', authenticate, checkPasswordChange, async (req, res) => {
  try {
    const { newEmail, password } = req.body || {};
    if (!newEmail || !password) {
      return res.status(400).json({ error: 'Нужны newEmail и password' });
    }
    if (!(await bcrypt.compare(password, req.user.password))) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    const existing = await User.findOne({ where: { email: newEmail } });
    if (existing) {
      return res.status(409).json({ error: 'Email уже зарегистрирован' });
    }
    req.user.email = newEmail;
    await req.user.save();
    res.json({ message: 'Email изменён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

await sequelize.sync();

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
