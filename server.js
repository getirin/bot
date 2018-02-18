const fetch = require('node-fetch');
const redis = require('redis');
const io = require('socket.io')();
const simulationData = require('./simulation');
const { createJWTInstance } = require('./jwtHelper');

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

const types = require('./types');

function createSimulationDataSenderForPayload(payload){

  return function sendSimulationData(socket, arr, timeout = 500){
    if(arr.length <= 0) return;
    console.log(arr);
    setTimeout(sendSimulationData, timeout, socket, arr.splice(1), timeout);
  };
}

function createLocationEvent(id, lastSeen, name){
  return { [id]: { lastSeen, name } };
}

const setup = async function(){
  const config = require('./config').server;
  const api = createAPI({ remote: config.remote });
  const client = await createRedisClient(config.events.host, config.events.port);
  const jwt = createJWTInstance(config.jwt);
  (await api.login('yengas123', 'asd'));

  function generateLocationUpdate(location){
    return {};
  }

  const typeToFunc = {
    [types.ORDER_ACCEPT_TYPE]: function(payload){
      console.log('Got accept starting simulation.');
      createSimulationDataSenderForPayload(payload)(io, simulationData);
    },
    [types.LOCATION_UPDATE_TYPE]: function(payload){
      console.log('Got location update', payload);
      createSimulationDataSenderForPayload(payload)(io, simulationData);
    }
  };

  client.subscribe(config.events.collection);
  client.on('message', function(channel, msg){
    const message = JSON.parse(msg);
    const func = typeToFunc[message.type];

    if(func) func(message);
  });

  await io.listen(config.socket.port);
};

setup()
  .then(() => {
    console.log('Server finished setting up, gracefully.');
  })
  .catch((err) => {
    console.log('there was an error with the server.');
    console.log(err);
    console.log(err.stack);
  });
