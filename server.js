const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const repl = require('repl');
const cookieParser = require('cookie-parser')
const requests = require('superagent');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

const server_cfg          = require('./settings/server.json');
let place_cfg             = require('./settings/place.json');

// #                                                                                               #
// #################################################################################################
// #                                                                                               #
const initDatabase        = require('./lib/handlers/initDatabase');
const connectionHandler   = require('./lib/handlers/events/connectionHandler');
const drawPixelHandler    = require('./lib/handlers/events/drawPixelHandler');
const redeemKeyHandler    = require('./lib/handlers/events/redeemKeyHandler');

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

const ipLastPaintTime = {};
let vip = [];

let activeCursors = {};

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

// disable the color stuff if we don't want it.
if( server_cfg.free_colors ){
  place_cfg.colors = false;
}

app.use(express.static(`${__dirname}/assets`));
app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


async function authenticateToken(req, res, next) {
	let token = req.cookies['token']
	if (token == null) return res.redirect(307,server_cfg.discoprd_auth_url)
		
	jwt.verify(token, server_cfg.jwt_secret, (err, decoded) => {	  
		if (err) return res.redirect(307,server_cfg.discoprd_auth_url)
		req.user = decoded
		next();
	});
}

app.get('/', authenticateToken, (req, res) => {
  // redirect to right domain if needed.
  if( server_cfg.redirect_domain !== false && req.headers['host'] != server_cfg.redirect_domain){
    res.redirect(server_cfg.redirect_domain);
    return;
  }

  res.sendFile(__dirname + '/assets/canvas.html');
});


app.get('/auth', (req, res) => {
  // #token_type=Bearer&access_token=NAEKsHWhE5Br3GttfrZcwexTWRBvRC&expires_in=604800&scope=identify
  res.sendFile(__dirname + '/assets/auth.html');
})

app.get('/check', (req, res) => {
  res.send({'msg':'Hello World!'})
})

app.post('/auth', async (req,res) => {
	let {tokenType, accessToken } = req.body;

	requests.get('https://discord.com/api/users/@me')
		.set('authorization', `${tokenType} ${accessToken}`)
		.end((err, dres) => {
			if (err) { return console.log(err); }
			data = JSON.parse(dres.text)	

			res.json( {
        // discord token is 7 days valid in general, we should stay under it, 
        // the cookie in the client is set to discord expire time to prevent usage of expired token.
				"cookie":jwt.sign( {"user":data} , server_cfg.jwt_secret ,{ "expiresIn" : server_cfg.jwt_expiry+"s" }),
				"cname":'token'
			 })
		});
})


// #                                                                                               #
// #################################################################################################
// #                                                                                               #

const db = initDatabase(server_cfg);


io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(socket.handshake.query.token, server_cfg.jwt_secret, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      socket.decoded.user.full_name = `${socket.decoded.user.username}#${socket.decoded.user.discriminator}`
      next();
    });
  } else {
      next(new Error('Authentication error'));
  }    
})
.on('connection', (socket) => {
  connectionHandler(socket, db, place_cfg, vip);

  socket.on('drawPixel', (data) => {
    drawPixelHandler(socket, db, place_cfg, vip, ipLastPaintTime, data, __dirname, io);
  });

  socket.on('redeemKey', (key) => {
    redeemKeyHandler(socket, place_cfg, vip, key, __dirname);
  });


  // When a user connects and sets a cursor position
  socket.on('setCursorPosition', (data) => {
    activeCursors[socket.decoded.user.id] = data;
  });

  // When a user disconnects
  socket.on('disconnect', () => {
    // Remove the user's cursor from the active cursors map    
    delete activeCursors[socket.decoded.user.id]

    io.emit('removeCursor', socket.decoded.user.id)
  });
});

// update all cursors in a set timeframe to prevent spamming data.
setInterval(() =>{
  io.emit('cursorsUpdate', activeCursors); // Broadcast updated cursor positions to all clients
}, 100)


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
  console.log("Closed REPL...")

  server.close(() => { // Close the server
    console.log('Server and REPL closed.');
    process.exit(0); // Exit the process
  });
};