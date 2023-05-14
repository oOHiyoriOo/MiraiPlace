const fs = require('fs');

function drawPixelHandler(socket, db, place_cfg, vip, ipLastPaintTime, data, mainDir) {
  const currentTime = Date.now();

  // Read banned IPs and cancel drawing if IP is banned.
  const bannedIps = JSON.parse(fs.readFileSync(`${mainDir}/settings/banned-ips.json`, { encoding: 'utf-8' }));
  if (bannedIps.includes(socket.decoded.user.id)) {
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

  if (!(ipLastPaintTime[socket.decoded.user.id] && currentTime - ipLastPaintTime[socket.decoded.user.id] < place_cfg.cooldown) || vip.includes(socket.decoded.user.id)) {
    console.log(`${socket.decoded.user.full_name} {${socket.decoded.user.id}} [${ vip.includes(socket.decoded.user.id) ? "VIP" : "User" }] => [${data.x},${data.y}](${data.color})`);
    
    ipLastPaintTime[socket.decoded.user.id] = currentTime;
    db.run('INSERT INTO pixels (x, y, color, userid) VALUES (?, ?, ?, ?)', [data.x, data.y, data.color, socket.decoded.user.id]);
    
    socket.emit('updateCanvas', data);
    socket.broadcast.emit('updateCanvas', data);
  }
}

module.exports = drawPixelHandler;
