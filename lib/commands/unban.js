const fs = require('fs').promises;

// Custom REPL commands
function unban(userID, mainDir) {
    fs.readFile(`${mainDir}/settings/banned-ips.json`, { encoding: 'utf-8' })
        .then((data) => {
            const bannedIps = JSON.parse(data);
            const index = bannedIps.indexOf(userID);

            if (index !== -1) {
                bannedIps.splice(index, 1);
                return fs.writeFile(
                    `${mainDir}/settings/banned-ips.json`,
                    JSON.stringify(bannedIps),
                    { encoding: 'utf-8' }
                );
            } else {
                console.log(`user ID ${userID} is not banned.`);
            }
        })
        .then(() => {
            console.log(`Unbanned: ${userID}`);
        })
        .catch((err) => {
            console.error('Error:', err);
        });
}

module.exports = unban;