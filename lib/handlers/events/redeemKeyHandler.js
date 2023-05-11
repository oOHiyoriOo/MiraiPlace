const fs = require('fs');

function redeemKeyHandler(socket, place_cfg, vip, key, mainDir) {
  const vipKeys = JSON.parse(fs.readFileSync(`${mainDir}/settings/vip-keys.json`, { encoding: 'utf-8' }));

  if (vipKeys.includes(key.key) && !(vip.includes(socket.handshake.session.userID))) {
    console.log(`${socket.request.connection.remoteAddress} Redeemed: ${key.key}`);

    vipKeys.splice(vipKeys.indexOf(key.key), 1); // Remove used key.
    fs.writeFileSync(`${mainDir}/settings/vip-keys.json`, JSON.stringify(vipKeys), { encoding: 'utf-8' });

    console.log(`Redeem: ${socket.handshake.session.userID}`)

    vip.push(socket.handshake.session.userID); // Save IP as VIP
    socket.emit('settings', place_cfg); // Toggle reload for new cooldown to apply.
  }
}

module.exports = redeemKeyHandler;