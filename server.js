const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const repl = require('repl');

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

const server_cfg =        require('./settings/server.json');
let place_cfg =         require('./settings/place.json');

// #                                                                                               #
// #################################################################################################
// #                                                                                               #
const initDatabase =      require('./lib/handlers/initDatabase');
const connectionHandler = require('./lib/handlers/events/connectionHandler');
const drawPixelHandler =  require('./lib/handlers/events/drawPixelHandler');
const redeemKeyHandler =  require('./lib/handlers/events/redeemKeyHandler');

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

const ipLastPaintTime = {};
let vip = [];

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

// disable the color stuff if we don't want it.
if( server_cfg.free_colors ){
  place_cfg.colors = false;
}

app.use(express.static(`${__dirname}/assets`));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/assets/index.html');
});

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

const db = initDatabase(server_cfg);

io.on('connection', (socket) => {
  connectionHandler(socket, db, place_cfg, vip);

  socket.on('drawPixel', (data) => {
    drawPixelHandler(socket, db, place_cfg, vip, ipLastPaintTime, data, __dirname);
  });

  socket.on('redeemKey', (key) => {
    redeemKeyHandler(socket, place_cfg, vip, key, __dirname);
  });
});

server.listen(server_cfg.port, server_cfg.host, () => {
  console.log(`Server running on: http://${server_cfg.host}:${server_cfg.port} \nlocal: http://127.0.0.1:${server_cfg.port}\nhello pterodactyl!`);
});

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

const replServer = repl.start({ prompt: '' });

const ban = require('./lib/commands/ban');
const unban = require('./lib/commands/unban');
const getkey = require('./lib/commands/getkey');

replServer.context.ban = (clientIp) => ban(clientIp, __dirname);
replServer.context.unban = (clientIp) => unban(clientIp, __dirname);
replServer.context.getkey = () => getkey(__dirname);



replServer.context.shutdown = () => {
  console.log('Exiting the server and REPL...');
  replServer.close(); // Close the REPL
  server.close(() => { // Close the server
    console.log('Server and REPL closed.');
    process.exit(0); // Exit the process
  });
};