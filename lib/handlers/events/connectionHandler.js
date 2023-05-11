function connectionHandler(socket, db, place_cfg, vip) {

  if (!socket.handshake.session.userID) {
    console.log(`Setting new SessionID: ${socket.id}`)
    socket.handshake.session.userID = socket.id;
    socket.handshake.session.save();
  }

  
  // Enable spam for VIP / MOD
  const clientGameConfig = { ...place_cfg };

  console.log(`Connection: ${socket.handshake.session.userID}`)
  if (vip.includes(socket.handshake.session.userID)) {
    clientGameConfig.cooldown = 0;
  }
  socket.emit('settings', clientGameConfig); // Send game config to client.

  db.all('SELECT x, y, color FROM pixels', (err, rows) => {
    socket.emit('loadCanvas', rows);
  });
}

module.exports = connectionHandler;
