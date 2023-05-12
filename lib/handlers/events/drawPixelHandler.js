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

  // place_cfg.colors = false if we want free choosing.
  // prevent spoof colors, if place_cfg.colors is an array it bypasses this check.
  // if data.color is in the array it also passes 
  if( (place_cfg.colors !== false) && !(place_cfg.colors).includes(data.color) ){
    return;
  }

  if (!(ipLastPaintTime[socket.id] && currentTime - ipLastPaintTime[socket.id] < place_cfg.cooldown) || vip.includes(socket.id)) {
    console.log(`${clientIp} [${ vip.includes(socket.id) ? "VIP" : "User" }] => [${data.x},${data.y}](${data.color})`);
    ipLastPaintTime[socket.id] = currentTime;
    db.run('INSERT INTO pixels (x, y, color) VALUES (?, ?, ?)', [data.x, data.y, data.color]);
    
    socket.emit('updateCanvas', data);
    socket.broadcast.emit('updateCanvas', data);
  }
}

module.exports = drawPixelHandler;
