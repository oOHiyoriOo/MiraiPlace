// Prevent browser zoom on HTML
document.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) {
        return;
    }
    e.preventDefault();
}, { passive: false });

// Reset canvas position and scale when Space key is pressed
document.addEventListener('keydown', function (event) {
    if (!(event.code === "Space") && !(event.key === ' ')) {
        return;
    }

    event.preventDefault();

    // Reset the canvas position and scale
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.scale = "1";
    document.getElementById('playground').scrollTo(0, 0);
});

// Prevent mousedown event on the playground for buttons other than left click
document.getElementById('playground').addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2) {
        e.preventDefault();
        return false;
    }
});

// Prevent context menu from appearing on right-click
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// Show help controls when F1 key is pressed
document.addEventListener('keydown', (e) => {
    if (!(e.key == "F1")) {
        return;
    }
    e.preventDefault();
    helpControlls();
});

// Zoom functionality when scrolling on canvas and playground
canvas.addEventListener('wheel', (e) => {
    zoom(e);
});

document.getElementById('playground').addEventListener('wheel', (e) => {
    zoom(e);
});


let previousPixel = { x: -1, y: -1, c: '#ffffff' };

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / canvas.offsetWidth;
    const x = Math.floor((event.clientX - rect.left) / (10 * scale)) * 10;
    const y = Math.floor((event.clientY - rect.top) / (10 * scale)) * 10;

    if (previousPixel.x === x && previousPixel.y === y) { return; }

    // Clear the temporary border
    if (previousPixel.x >= 0 && previousPixel.y >= 0 && (previousPixel.x !== x || previousPixel.y !== y)) {
        ctx.fillStyle = previousPixel.c;
        ctx.clearRect(previousPixel.x - 1, previousPixel.y - 1, 12, 12);
        ctx.fillRect(previousPixel.x, previousPixel.y, 10, 10);
        redrawDrawnPixels();
    }

    const pixelData = ctx.getImageData(x, y, 10, 10).data;
    const currentPixelColor = `#${prependZeroIfNeeded(pixelData[0].toString(16))}${prependZeroIfNeeded(pixelData[1].toString(16))}${prependZeroIfNeeded(pixelData[2].toString(16))}${prependZeroIfNeeded(pixelData[3].toString(16))}`;

    // Draw border around the current pixel
    ctx.strokeStyle = '#ffffffff';
    ctx.lineWidth = 0.1;
    ctx.fillStyle = currentPixelColor;
    ctx.strokeRect(x, y, 10, 10);

    // Store the current pixel color 
    // Update previous pixel position
    previousPixel.c = currentPixelColor;
    previousPixel.x = x;
    previousPixel.y = y;
});


