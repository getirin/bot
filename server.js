const fetch = require('node-fetch');
const redis = require('redis');
const io = require('socket.io')();

function createRedisClient(host, port){
  return new Promise((resolve, reject) => {
    const client = redis.createClient({ host, port });

    client.on('connect', () => resolve(client));
    client.on('error', (err) => reject(err));
  });
}


function createAPI({ remote }){
  function post(path, data){
    return fetch(
      `${remote}${path}`,
      {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        method: "POST",
        body: JSON.stringify(data)
      },
    )
  }

  return {
    login: async (username, password) => {
      const { token } = await post('/user/login', { name: username, password})
        .then(res => res.json())
        .catch(console.log);

      return token;
    }
  };
}

const types = {
  LOCATION_UPDATE_TYPE: 'LOCATION',
  ORDER_CREATE_TYPE: 'CREATE',
  ORDER_ACCEPT_TYPE: 'ACCEPT',
  ORDER_FINISH_TYPE: 'FINISH',
  REQUEST_CREATE_TYPE: 'REQUEST',
};

const setup = async function(){
  const config = require('./config').server;
  const api = createAPI({ remote: config.remote });
  const client = createRedisClient(config.events.host, config.events.port);

  client.subscribe(config.events.collection, (data) => {
    console.log(data);
  });

  console.log(await api.login('yengas123', 'asd'));
  await io.listen(config.socket.port);
};

setup()
  .then(() => {
    console.log('Server finished gracefully.');
  })
  .catch((err) => {
    console.log('there was an error with the server.');
    console.log(err);
    console.log(err.stack);
  });
