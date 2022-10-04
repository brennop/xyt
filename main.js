import "./style.css";
import QRCode from "qrcode";

const artCanvas = document.querySelector(".canvas");
const context = artCanvas.getContext("2d");
const input = document.querySelector(".input");

import jsQR from "jsqr";

// define a 16 colors palette
const pallet = [
  "#1a1c2c",
  "#5d275d",
  "#b13e53",
  "#ef7d57",
  "#ffcd75",
  "#a7f070",
  "#38b764",
  "#257179",
  "#29366f",
  "#3b5dc9",
  "#41a6f6",
  "#73eff7",
  "#f4f4f4",
  "#94b0c2",
  "#566c86",
  "#333c57",
];

const SIZE = 32;
const CANVAS_SIZE = 256;
const PIXEL_SIZE = CANVAS_SIZE / SIZE;
const RATIO = 16 / SIZE;

const url = new URL(window.location);
let expr = url.pathname.slice(1, 24);
if (!expr) {
  window.history.pushState({}, "", "/xy+");
  expr = "xy+";
}

input.value = expr;

const data = {
  expr,
};

let output = "art";

const lookup = {
  x: (s, { x }) => [x * RATIO, ...s],
  y: (s, { y }) => [y * RATIO, ...s],
  t: (s, { t }) => [t / 256, ...s],
  i: (s, { i }) => [i / RATIO, ...s],
  r: (s) => [Math.random(), ...s],

  "+": ([a, b, ...s]) => [b + a, ...s],
  "-": ([a, b, ...s]) => [b - a, ...s],
  "*": ([a, b, ...s]) => [b * a, ...s],
  "/": ([a, b, ...s]) => [b / a, ...s],
  "%": ([a, b, ...s]) => [b % a, ...s],
  "&": ([a, b, ...s]) => [b & a, ...s],
  "|": ([a, b, ...s]) => [b | a, ...s],
  "^": ([a, b, ...s]) => [b ^ a, ...s],
  "=": ([a, b, ...s]) => [b === a, ...s],
  "<": ([a, b, ...s]) => [b < a, ...s],
  ">": ([a, b, ...s]) => [b > a, ...s],
  "!": ([a, ...s]) => [!a, ...s],
  "~": ([a, ...s]) => [~a, ...s],
  "?": ([a, b, c, ...s]) => [a ? b : c, ...s],

  S: ([a, ...s]) => [Math.sin(a), ...s],
  C: ([a, ...s]) => [Math.cos(a), ...s],
  T: ([a, ...s]) => [Math.tan(a), ...s],
  A: ([a, ...s]) => [Math.abs(a), ...s],
  H: ([a, b, ...s]) => [Math.hypot(a, b), ...s],
  F: ([a, ...s]) => [Math.floor(a), ...s],
  R: ([a, ...s]) => [Math.sqrt(a), ...s],
  D: ([a, ...s]) => [a, a, ...s],

  0: (s) => [0, ...s],
  1: (s) => [1, ...s],
  2: (s) => [2, ...s],
  3: (s) => [3, ...s],
  4: (s) => [4, ...s],
  5: (s) => [5, ...s],
  6: (s) => [6, ...s],
  7: (s) => [7, ...s],
  8: (s) => [8, ...s],
  9: (s) => [9, ...s],
  a: (s) => [10, ...s],
  b: (s) => [11, ...s],
  c: (s) => [12, ...s],
  d: (s) => [13, ...s],
  e: (s) => [14, ...s],
  f: (s) => [15, ...s],
  l: (s) => [16, ...s],
};

function _eval(expr, x, y, t, i) {
  return [...expr].reduce((stack, token) => {
    return lookup[token]?.(stack, { x, y, t, i }) || stack;
  }, []);
}

const video = document.createElement("video");
navigator.mediaDevices.getUserMedia({ video: {
  facingMode: "environment",
} }).then((stream) => {
  video.srcObject = stream;
  video.setAttribute("playsinline", true);
  video.play();
  requestAnimationFrame(render);
});

let lastLocation = null;

function render(t) {
  if (output === "art") {
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const [value] = _eval(data.expr, i, j, t, i * SIZE + j);
        const color = pallet[Math.floor(value) & 0xf];
        context.fillStyle = color;
        context.fillRect(
          i * PIXEL_SIZE,
          j * PIXEL_SIZE,
          PIXEL_SIZE,
          PIXEL_SIZE
        );
      }
    }
  } else if (output === "qrcode") {
    QRCode.toCanvas(artCanvas, data.expr, {
      margin: 5,
      width: CANVAS_SIZE,
    });
  }

  try {
    const videoCanvas = document.querySelector(".video");
    videoCanvas.width = video.videoWidth;
    videoCanvas.height = video.videoHeight;
    const videoContext = videoCanvas.getContext("2d");
    videoContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const imageData = videoContext.getImageData(
      0,
      0,
      video.videoWidth,
      video.videoHeight
    );
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    const location = code?.location || lastLocation;
    lastLocation = location;

    if (location) {
      // draw artCanvas at location
      videoContext.drawImage(
        artCanvas,
        location.topLeftCorner.x,
        location.topLeftCorner.y,
        location.topRightCorner.x - location.topLeftCorner.x,
        location.bottomLeftCorner.y - location.topLeftCorner.y
      );
    }
  } catch (e) {
    console.log(e);
  }

  requestAnimationFrame(render);
}

// rerender on input change
input.addEventListener("input", () => {
  data.expr = input.value;
});

artCanvas.addEventListener("click", () => {
  output = output === "art" ? "qrcode" : "art";
});
