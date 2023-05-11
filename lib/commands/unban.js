const fs = require('fs').promises;

// Custom REPL commands
function unban(clientIp, mainDir) {
    fs.readFile(`${mainDir}/settings/banned-ips.json`, { encoding: 'utf-8' })
        .then((data) => {
            const bannedIps = JSON.parse(data);
            const index = bannedIps.indexOf(clientIp);

            if (index !== -1) {
                bannedIps.splice(index, 1);
                return fs.writeFile(
                    `${mainDir}/settings/banned-ips.json`,
                    JSON.stringify(bannedIps),
                    { encoding: 'utf-8' }
                );
            } else {
                console.log(`IP address ${clientIp} is not banned.`);
            }
        })
        .then(() => {
            console.log(`Unbanned: ${clientIp}`);
        })
        .catch((err) => {
            console.error('Error:', err);
        });
}

module.exports = unban;