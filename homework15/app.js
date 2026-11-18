import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3000;

// Создаём Express-приложение и HTTP-сервер на его основе
const app = express();
const server = createServer(app);

// Подключаем Socket.io к HTTP-серверу
const io = new Server(server);

// Отдаём статические файлы (index.html и др.) из папки public
app.use(express.static('public'));

// Обработка подключения пользователя
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Получаем сообщение от клиента
  socket.on('chat message', (message) => {
    console.log(`Message from ${socket.id}: ${message}`);

    // Отправляем клиенту подтверждение о получении
    socket.emit('message received', {
      text: message,
      status: 'Message received by server',
      time: new Date().toLocaleTimeString(),
    });
  });

  // Обработка отключения пользователя
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
