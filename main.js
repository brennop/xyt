import "./style.css";

const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
const debug = document.querySelector(".debug");

// define a 16 colors palette
const pallet = {
  0: "#000000",
  1: "#005500",
  2: "#00aa00",
  3: "#00ff00",
  4: "#0000ff",
  5: "#0055ff",
  6: "#00aaff",
  7: "#00ffff",
  8: "#ff0000",
  9: "#ff5500",
  10: "#ffaa00",
  11: "#ffff00",
  12: "#ff00ff",
  13: "#ff55ff",
  14: "#ffaaff",
  15: "#ffffff",
};

const SIZE = 16;
const CANVAS_SIZE = 256;
const PIXEL_SIZE = CANVAS_SIZE / SIZE;
const RATIO = 16 / SIZE;

const data = {
  expr: "x y +",
};

const lookup = {
  x: (x, y, t, i, s) => [...s, x * RATIO],
  y: (x, y, t, i, s) => [...s, y * RATIO],
  t: (x, y, t, i, s) => [...s, t],
  i: (x, y, t, i, s) => [...s, i],
  "+": (x, y, t, i, [a, b, ...s]) => [...s, a + b],
  "-": (x, y, t, i, [a, b, ...s]) => [...s, a - b],
  "*": (x, y, t, i, [a, b, ...s]) => [...s, a * b],
  "/": (x, y, t, i, [a, b, ...s]) => [...s, a / b],
  "%": (x, y, t, i, [a, b, ...s]) => [...s, a % b],
  "&": (x, y, t, i, [a, b, ...s]) => [...s, a & b],
  "|": (x, y, t, i, [a, b, ...s]) => [...s, a | b],
  "^": (x, y, t, i, [a, b, ...s]) => [...s, a ^ b],
  S: (x, y, t, i, [a, ...s]) => [...s, Math.sin(a)],
  C: (x, y, t, i, [a, ...s]) => [...s, Math.cos(a)],
  T: (x, y, t, i, [a, ...s]) => [...s, Math.tan(a)],
  " ": (x, y, t, i, s) => s,
  0: (x, y, t, i, s) => [...s, 0],
  1: (x, y, t, i, s) => [...s, 1],
  2: (x, y, t, i, s) => [...s, 2],
  3: (x, y, t, i, s) => [...s, 3],
  4: (x, y, t, i, s) => [...s, 4],
  5: (x, y, t, i, s) => [...s, 5],
  6: (x, y, t, i, s) => [...s, 6],
  7: (x, y, t, i, s) => [...s, 7],
  8: (x, y, t, i, s) => [...s, 8],
  9: (x, y, t, i, s) => [...s, 9],
  a: (x, y, t, i, s) => [...s, 10],
  b: (x, y, t, i, s) => [...s, 11],
  c: (x, y, t, i, s) => [...s, 12],
  d: (x, y, t, i, s) => [...s, 13],
  e: (x, y, t, i, s) => [...s, 14],
  f: (x, y, t, i, s) => [...s, 15],
};

function _eval(expr, x, y, t, i) {
  return [...expr].reduce((stack, token) => {
    return lookup[token]?.(x, y, t, i, stack);
  }, []);
}

function render(t) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const value = _eval(data.expr, i, j, t)
      const color = pallet[Math.floor(value) & 0xf];
      context.fillStyle = color;
      context.fillRect(i * PIXEL_SIZE, j * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }

  requestAnimationFrame(render);
}

const input = document.querySelector(".input");

// rerender on input change
input.addEventListener("input", () => {
  data.expr = input.value;
});

requestAnimationFrame(render);
