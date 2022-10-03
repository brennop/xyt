import "./style.css";
import QRCode from "qrcode";

import QrScanner from "qr-scanner";

const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
const input = document.querySelector(".input");
const video = document.querySelector("video");

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

let renderer = "art";

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

function render(t) {
  if (renderer === "art") {
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
  } else if (renderer === "qrcode") {
    QRCode.toCanvas(canvas, data.expr, {
      margin: 0,
      width: CANVAS_SIZE,
    });
  }

  requestAnimationFrame(render);
}

// rerender on input change
input.addEventListener("input", () => {
  data.expr = input.value;
});

canvas.addEventListener("click", () => {
  renderer = renderer === "art" ? "qrcode" : "art";
});

const qrScanner = new QrScanner(
  video,
  (result) => {
    const { cornerPoints, data: expr } = result;
    // position canvas on top of the QR code
    // the video feed is mirrored, so we need to flip the x coordinates
    const [topLeft, topRight, bottomRight, bottomLeft] = cornerPoints;

    const width = Math.hypot(
      topRight.x - topLeft.x,
      topRight.y - topLeft.y
    );
    const height = Math.hypot(
      bottomRight.x - topRight.x,
      bottomRight.y - topRight.y
    );

    const angle = Math.atan2(
      topRight.y - topLeft.y,
      topRight.x - topLeft.x
    );

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.transform = `translate(${screenW/2 - topLeft.x - width/2}px, ${- screenH/2 + topLeft.y + height/2}px) rotate(${-angle}rad)`;
    

    // update expression
    data.expr = expr;
  },
  {
    returnDetailedScanResult: true,
  }
);

video.addEventListener("click", () => {
  qrScanner.stop();
  video.style.display = "none";
});

qrScanner.start();

requestAnimationFrame(render);
