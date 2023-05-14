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

let ServerMap;
let socket; // make the socket accessable globally.

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
