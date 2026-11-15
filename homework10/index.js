import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const SECRET = 'dev_secret';

app.use(express.json());

let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
  },
];

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
}

function authenticateJWT(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Токен отсутствует' });
  }
  try {
    req.auth = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен просрочен' });
    }
    res.status(401).json({ error: 'Неверный токен' });
  }
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.auth.role !== role) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    next();
  };
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find((u) => u.username === username);
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }
  res.json({ token: createToken(user) });
});

app.put('/update-email', authenticateJWT, (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Нужен email' });
  }
  const user = users.find((u) => u.id === req.auth.id);
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  if (users.some((u) => u.email === email && u.id !== user.id)) {
    return res.status(409).json({ error: 'Email уже используется' });
  }
  user.email = email;
  res.json({ message: 'Email обновлён', user: { id: user.id, username: user.username, email: user.email } });
});

app.post('/delete-account', authenticateJWT, (req, res) => {
  const user = users.find((u) => u.id === req.auth.id);
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  users = users.filter((u) => u.id !== req.auth.id);
  res.json({ message: 'Аккаунт успешно удалён' });
});

app.put('/update-role', authenticateJWT, authorizeRole('admin'), (req, res) => {
  const { id, role } = req.body || {};
  if (id === undefined || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Нужны id и role (user или admin)' });
  }
  const user = users.find((u) => u.id === Number(id));
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  user.role = role;
  res.json({ message: 'Роль обновлена', user: { id: user.id, username: user.username, role: user.role } });
});

app.post('/refresh-token', authenticateJWT, (req, res) => {
  const user = users.find((u) => u.id === req.auth.id);
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  res.json({ token: createToken(user) });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
