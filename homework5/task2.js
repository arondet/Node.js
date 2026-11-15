const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  try {
    throw new Error('Тестовая ошибка сервера');
  } catch (err) {
    const line = `[${new Date().toISOString()}] ${err.message}\n`;
    fs.appendFile('errors.log', line, (writeErr) => {
      if (writeErr) {
        console.error('Ошибка записи в лог:', writeErr);
      }
    });
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
