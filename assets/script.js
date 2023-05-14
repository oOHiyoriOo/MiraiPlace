const canvas = document.getElementById('placeCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');

let colors = ['#000000']; // default color is just white.
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

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
      let c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}


// #                                                                                               #
// #################################################################################################
// #                                                                                               #



const token = getCookie('token');
if (token) {
    startSocket(token)
} else {
    alert("Something wen't wrong, try reloading the Page!")
}

function startSocket(token){
  const socket = io({
    query: { token }
  });

  socket.on('connect_error', (error) => {
    if (error.message === 'Authentication error') {
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.reload();
    }
  });


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
      document.getElementById("headerBanner").innerHTML += `<input type="color" id="colorSpace" onchange="colorPicking(event)" oninput="colorPicking(event)" value="#6711bd">`;
      currentColor = document.getElementById('colorSpace').value;
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

  canvas.addEventListener('click', (event) => {

    const currentTime = Date.now();
  
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / canvas.offsetWidth;
    const x = Math.floor((event.clientX - rect.left) / (10 * scale)) * 10;
    const y = Math.floor((event.clientY - rect.top) / (10 * scale)) * 10;
  
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const currentPixelColor = `#${prependZeroIfNeeded(pixelData[0].toString(16))}${prependZeroIfNeeded(pixelData[1].toString(16))}${prependZeroIfNeeded(pixelData[2].toString(16))}`;
  
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
  
  document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
      event.preventDefault();
      let userInput = prompt('Key:');
    
      socket.emit('redeemKey', { "key": userInput });
    }
  });
}

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

let scaleStep = 0.1;
let scale = 1;

canvas.addEventListener('wheel', (e) => {
  zoom(e)
});

document.getElementById('playground').addEventListener('wheel', (e) => {
  zoom(e)
});

function zoom(e){
  if(e.shiftKey || !(e.ctrlKey) ){ return; }

  e.preventDefault();

  // Determine whether the wheel was scrolled up or down
  if (e.deltaY < 0) {
    scale += scaleStep;
  } else {
    scale -= scaleStep;
  }

  scale = Math.max(0.1, scale);
  
  console.log(scale)
  
  canvas.style.scale = scale;
}


// prevent Browser Zoom on html.

document.addEventListener('wheel', (e) => {
  if( !e.ctrlKey ){ return; }
  e.preventDefault();
}, { passive: false });

document.getElementById('playground').addEventListener('onmousedown', (e) => {
  if( e.button === 2 ){ 
    e.preventDefault();
    return false;
  }
  console.log( e )
})

///////////////////////////////////////
dragElement(canvas);

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  elmnt.onmousedown = function(e) {
    if(e.button !== 1) return; // Only proceed if mouse wheel button is pressed
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmousemove = elementDrag;
    document.onmouseup = closeDragElement;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // Compute the new position
    var newTop = elmnt.offsetTop - pos2;
    var newLeft = elmnt.offsetLeft - pos1;

    // Apply the new position
    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
