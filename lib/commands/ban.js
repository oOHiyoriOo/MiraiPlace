const fs = require('fs').promises;


// Custom REPL commands
function ban(userID, mainDir) {
    fs.readFile(`${mainDir}/settings/banned-ips.json`, { encoding: 'utf-8' })
        .then((data) => {
            const bannedIps = JSON.parse(data);
            bannedIps.push(userID);

            return fs.writeFile(
                `${mainDir}/settings/banned-ips.json`,
                JSON.stringify(bannedIps),
                { encoding: 'utf-8' }
            );
        })
        .then(() => {
            console.log(`Banned: ${userID}`);
        })
        .catch((err) => {
            console.error('Error:', err);
        });
}

module.exports = ban;