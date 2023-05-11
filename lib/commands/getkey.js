const fs = require('fs');

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getkey(mainDir) {
  const newKey = generateUUID();
  const vipKeysPath = `${mainDir}/settings/vip-keys.json`;
  const vipKeys = JSON.parse(fs.readFileSync(vipKeysPath, { encoding: 'utf-8' }));

  vipKeys.push(newKey);
  fs.writeFileSync(vipKeysPath, JSON.stringify(vipKeys), { encoding: 'utf-8' });

  console.log(`New VIP key generated: ${newKey}`);
}

module.exports = getkey;