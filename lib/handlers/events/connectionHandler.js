function connectionHandler(socket, db, place_cfg, vip) {
 
  // Enable spam for VIP / MOD
  const clientGameConfig = { ...place_cfg };

  if (vip.includes(socket.decoded.user.id)) {
    clientGameConfig.cooldown = 0;
  }
  clientGameConfig.id = socket.decoded.user.id // let the client know who he is.
  socket.emit('settings', clientGameConfig); // Send game config to client.

  db.all('SELECT x, y, color FROM pixels', (err, rows) => {
    socket.emit('loadCanvas', rows);
  });
}

module.exports = connectionHandler;
