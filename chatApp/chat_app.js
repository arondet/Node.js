const EventEmitter = require('events');

const chatEmitter = new EventEmitter();

function sendMessage(user, message, emitter) {
  emitter.emit('message', user, message);
}

chatEmitter.on('message', (user, message) => {
  console.log(`${user}: ${message}`);
});

sendMessage('Anna', 'Привет всем!', chatEmitter);
sendMessage('Max', 'Привет, Анна!', chatEmitter);
sendMessage('Olga', 'Как дела?', chatEmitter);
