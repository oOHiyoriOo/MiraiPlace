const fs = require('fs');

function drawPixelHandler(socket, db, place_cfg, vip, ipLastPaintTime, data, mainDir) {
  const clientIp = socket.request.connection.remoteAddress;
  const currentTime = Date.now();

  // Read banned IPs and cancel drawing if IP is banned.
  const bannedIps = JSON.parse(fs.readFileSync(`${mainDir}/settings/banned-ips.json`, { encoding: 'utf-8' }));
  if (bannedIps.includes(clientIp)) {
    socket.emit('banned', 1);
    return;
  }

  // Is the client known? && finished cooldown? && not in VIP
  console.log(`Draw: ${socket.handshake.session.userID}`)

  if (!(ipLastPaintTime[socket.handshake.session.userID] && currentTime - ipLastPaintTime[socket.handshake.session.userID] < place_cfg.cooldown) || vip.includes(socket.handshake.session.userID)) {
    console.log(`${clientIp} [${ vip.includes(socket.handshake.session.userID) ? "VIP" : "User" }] => [${data.x},${data.y}](${data.color})`);
    ipLastPaintTime[socket.handshake.session.userID] = currentTime;
    db.run('INSERT INTO pixels (x, y, color) VALUES (?, ?, ?)', [data.x, data.y, data.color]);
    
    socket.emit('updateCanvas', data);
    socket.broadcast.emit('updateCanvas', data);
  }
}

module.exports = drawPixelHandler;
