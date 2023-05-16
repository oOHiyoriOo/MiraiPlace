const canvas = document.getElementById('placeCanvas');

const ctx = canvas.getContext('2d', { willReadFrequently: true });
const colorPicker = document.getElementById('colorPicker');

let colors = ['#000000']; // default color is just white.
let currentColor = colors[0];
let lastPaintTime = 0;
let paintCooldown = Infinity;
let initDone = false; // used to determine if the page should be reloaded.

let scaleStep = 0.1;
let scale = 1;

let socket; // make the socket accessable globally.
let colorPalettes = new FixedSizeList(6);

let gameCFG;
let isThrottled = false;

["#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF","#FFFFFF"].forEach(color => {
    colorPalettes.append(color);
});

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

const token = getCookie('token');

if (token) {
    startSocket(token)
} else {
    alert("Something wen't wrong, try reloading the Page!")
}

// #                                                                                               #
// #################################################################################################
// #                                                                                               #

// Receive the updated cursor positions from the server
socket.on('cursorsUpdate', (data) => {
  updateCursorPositions(data);
});

function createCursorElement(cursorId, position) {
  const cursorElement = document.createElement('span');
  cursorElement.classList.add('cursor');
  cursorElement.id = cursorId;
  cursorElement.style.left = `${position.x}px`;
  cursorElement.style.top = `${position.y}px`;
  cursorContainer.appendChild(cursorElement);
  cursorElement.innerHTML += `<svg width="24" height="36" viewBox="0 0 24 36" fill="none">
  <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
      fill="${generateUserColor(cursorId)}"></path>
</svg>`;
}

function updateCursorPositions(positionData) {
  const canvasRect = canvas.getBoundingClientRect();
  const scaleX = canvasRect.width / canvas.width;
  const scaleY = canvasRect.height / canvas.height;

  for (const [cursorId, position] of Object.entries(positionData)) {
    const cursorElement = document.getElementById(cursorId);
    if (cursorElement) {
      const left = position.x * scaleX + canvasRect.left;
      const top = position.y * scaleY + canvasRect.top;

      cursorElement.style.left = `${left}px`;
      cursorElement.style.top = `${top}px`;

    } else {
      createCursorElement(cursorId, position);
    }
  }
}