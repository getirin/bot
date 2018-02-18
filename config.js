const port = 3000;

module.exports = {
  client: {
    port
  },
  server: {
    remote: 'http://localhost:8080',
    jwt: {
      key: process.env.JWT_KEY || 'helloworld',
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
    },
    events: {
      host: 'localhost',
      port: '6379',
      collection: 'events'
    },
    socket: {
      port
    },
  },
};
