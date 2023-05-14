function loadCanvasHandler(socket, db){
    db.all('SELECT x, y, color FROM pixels', (err, rows) => {
        socket.emit('loadCanvas', rows);
    });
    console.log("Reloading Canvas")
}

module.exports = loadCanvasHandler;