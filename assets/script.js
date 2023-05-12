const canvas = document.getElementById('placeCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
let colors = ['#FFFFFF']; // default color is just white.
let currentColor = colors[0];
let lastPaintTime = 0;
let paintCooldown = Infinity;
let initDone = false; // used to determine if the page should be reloaded.

// #                                                                                               #
// #################################################################################################
// #                                                                                               #
// Helper functions.


// check if the colors given from backend are valid, so it shows a set of default colors, if it fails.
function isValidHexArray(arr) {
  if (!Array.isArray(arr)) { // check if the type is right
    return false;
  }

  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/; // regex for colors formar: # ff ff ff

  return arr.every(color => typeof color === 'string' && hexRegex.test(color)); // check if every entry matches it to prevent falty entrys
}


function setTimer() {
  const timerElement = document.getElementById('cooldown-timer'); // span to show cooldown.
  sec = paintCooldown / 1000;
  let timer = setInterval(() => {
    timerElement.innerHTML = '00:' + ( sec > -1 ? prependZeroIfNeeded(sec) : "00" );
    sec--;
    if (sec < 0) {
      clearInterval(timer);
    }
  }, 1000);
}

function prependZeroIfNeeded(num) {
  return num < 10 ? '0' + num : num;
}

function colorPicking(e){
  currentColor = e.target.value;
}

// #                                                                                               #
// #################################################################################################
// #                                                                                               #



const socket = io();

socket.on('settings', (cfg) => {

  // little snippet to reload the page when i restart the server.
  if( !initDone ){ initDone = true; }
  else { window.location.reload() }

  // get the cooldown and set the canvas size.
  paintCooldown = cfg.cooldown;
  canvas.setAttribute("width", cfg.width)
  canvas.setAttribute("height", cfg.height)

  // clear the color picker elem to prevent double or triple elements.
  document.getElementById("colorPicker").innerHTML = "";
  
  // enable free colors, if the server allows it! :D
  if( cfg.colors === false ){
    document.getElementById("headerBanner").innerHTML += `<input type="color" id="colorSpace" onchange="colorPicking(event)" oninput="colorPicking(event)">`;
    return;
  }

  // set the color buttons if we need them.
  colors = isValidHexArray(cfg.colors) ? cfg.colors : colors;
  colors.forEach(color => {
    const button = document.createElement('button');
    button.style.backgroundColor = color;
    button.classList.add('colorButton');
    button.addEventListener('click', () => {
      currentColor = color;
    });
    colorPicker.appendChild(button);
  });

})


socket.on('loadCanvas', (pixels) => {
  pixels.forEach(pixel => {
    ctx.fillStyle = pixel.color;
    ctx.fillRect(pixel.x, pixel.y, 10, 10);
  });
});

socket.on('updateCanvas', (data) => {
  ctx.fillStyle = data.color;
  ctx.fillRect(data.x, data.y, 10, 10);
});

socket.on('banned', (bit) => {
  alert("You are Banned from drawing.")
});

canvas.addEventListener('mousedown', (event) => {
  const currentTime = Date.now();

  
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / 10) * 10;
  const y = Math.floor((event.clientY - rect.top) / 10) * 10;

  const pixelData = ctx.getImageData(x, y, 1, 1).data;
  const currentPixelColor = `#${prependZeroIfNeeded(pixelData[0].toString(16))}${prependZeroIfNeeded(pixelData[1].toString(16))}${prependZeroIfNeeded(pixelData[2].toString(16))}`;
  console.log( `${currentPixelColor } <= ${currentColor}` )


  // if it's already the color or time is not up, cancel.
  // btw time is also calculated by the server, no cheating here...
  if ( (currentTime - lastPaintTime < paintCooldown) ||
        ( currentPixelColor.toLowerCase() == currentColor.toLowerCase() ) ) {
    return;
  }
  lastPaintTime = currentTime;


  socket.emit('drawPixel', { x, y, color: currentColor });
  setTimer();
});


// #                                                                                               #
// #################################################################################################
// #                                                                                               #
// some utils.

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.shiftKey && event.key === 'F') {
    event.preventDefault();
    let userInput = prompt('Key:');
    
    console.log("Send: "+ JSON.stringify( { "key": userInput } ) )
    socket.emit('redeemKey', { "key": userInput });
  }
});