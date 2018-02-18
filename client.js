const config = require('./config');
const io = require('socket.io')(`http://localhost:${config.client.port}`);
const types = require('./types');

Object.values(types).forEach((key) => {
  io.on(key, (message) => {
    console.log(key, message);
  });
});
