
module.exports = {
  client: {

  },
  server: {
    remote: 'http://localhost:8080',
    redis: {
      host: 'localhost',
      port: '6379',
    },
    socket: {
      port: 3000
    }
  },
};
