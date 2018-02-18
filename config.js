
module.exports = {
  client: {

  },
  server: {
    remote: 'http://localhost:8080',
    events: {
      host: 'localhost',
      port: '6379',
      collection: 'events'
    },
    socket: {
      port: 3000
    },
  },
};
