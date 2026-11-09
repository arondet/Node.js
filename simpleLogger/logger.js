const fs = require('fs');

function logMessage(message) {
  fs.appendFile('log.txt', message + '\n', (err) => {
    if (err) {
      console.error('Ошибка при записи лога:', err);
    }
  });
}

module.exports = logMessage;