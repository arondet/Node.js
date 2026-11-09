const fs = require('fs');

fs.writeFile('info.txt', 'Node.js is awesome!', (err) => {
  if (err) {
    console.error('Ошибка записи файла:', err);
    return;
  }
  console.log('Файл info.txt успешно записан');

  fs.readFile('info.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка чтения файла:', err);
      return;
    }
    console.log('Содержимое файла:', data);
  });
});
