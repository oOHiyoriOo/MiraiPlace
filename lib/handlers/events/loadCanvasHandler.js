function loadCanvasHandler(socket, db){
    db.all('SELECT x, y, color FROM pixels', (err, rows) => {
        socket.emit('loadCanvas', rows);
    });
}

module.exports = loadCanvasHandler;