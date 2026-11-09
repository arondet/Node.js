const fs = require('fs');

fs.mkdir('myFolder', (err) => {
  if (err) {
    console.error('Ошибка создания каталога:', err);
    return;
  }
  console.log('Каталог myFolder успешно создан');

  fs.rmdir('myFolder', (err) => {
    if (err) {
      console.error('Ошибка удаления каталога:', err);
      return;
    }
    console.log('Каталог myFolder успешно удалён');
  });
});
