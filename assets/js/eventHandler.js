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