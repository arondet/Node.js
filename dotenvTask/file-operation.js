const fs = require('fs');
require('dotenv').config();

const filename = process.env.FILENAME;

fs.writeFile(filename, 'Hello from dotenv task!', (err) => {
  if (err) {
    console.error('Ошибка записи файла:', err);
    return;
  }
  console.log(`Файл ${filename} создан`);

  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка чтения файла:', err);
      return;
    }
    console.log('Содержимое файла:', data);
  });
});
