import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const SECRET = 'dev_secret';

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Неверный токен' });
  }
}

export function checkPasswordChange(req, res, next) {
  if (req.user.mustChangePassword) {
    return res.status(403).json({
      error: 'Необходимо сменить пароль',
      redirect: '/change-password',
    });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  next();
}
