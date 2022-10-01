import "./style.css";

const canvas = document.querySelector(".canvas");
const context = canvas.getContext("2d");
const debug = document.querySelector(".debug");

// define a 16 colors palette
const pallet = {
  0: "#fbffce",
  1: "#b4dc25",
  2: "#26a630",
  3: "#5af0f7",
  4: "#fbd439",
  5: "#ff9cc9",
  6: "#25e2c0",
  7: "#08a0c0",
  8: "#f09432",
  9: "#f43666",
  10: "#c635bc",
  11: "#165a7d",
  12: "#dc532d",
  13: "#a12536",
  14: "#6f288b",
  15: "#260e3e",
};

const SIZE = 16;
const CANVAS_SIZE = 256;
const PIXEL_SIZE = CANVAS_SIZE / SIZE;
const RATIO = 16 / SIZE;

const data = {
  expr: "x y +",
};

const lookup = {
  x: (x, y, t, i, s) => [x * RATIO, ...s],
  y: (x, y, t, i, s) => [y * RATIO, ...s],
  t: (x, y, t, i, s) => [t / 256, ...s],
  i: (x, y, t, i, s) => [i, ...s],
  "+": (x, y, t, i, [a, b, ...s]) => [a + b, ...s],
  "-": (x, y, t, i, [a, b, ...s]) => [a - b, ...s],
  "*": (x, y, t, i, [a, b, ...s]) => [a * b, ...s],
  "/": (x, y, t, i, [a, b, ...s]) => [a / b, ...s],
  "%": (x, y, t, i, [a, b, ...s]) => [a % b, ...s],
  "&": (x, y, t, i, [a, b, ...s]) => [a & b, ...s],
  "|": (x, y, t, i, [a, b, ...s]) => [a | b, ...s],
  "^": (x, y, t, i, [a, b, ...s]) => [a ^ b, ...s],
  S: (x, y, t, i, [a, ...s]) => [Math.sin(a), ...s],
  C: (x, y, t, i, [a, ...s]) => [Math.cos(a), ...s],
  T: (x, y, t, i, [a, ...s]) => [Math.tan(a), ...s],
  V: (x, y, t, i, [a, ...s]) => [Math.sqrt(a), ...s],
  R: (x, y, t, i, s) => [Math.random() * 16, ...s],
  D: (x, y, t, i, [a, ...s]) => [a, a, ...s],
  N: (x, y, t, i, [a, ...s]) => [(a + 1) * 8, ...s],


  " ": (x, y, t, i, s) => s,
  "(": (x, y, t, i, s) => s,
  ")": (x, y, t, i, s) => s,
  0: (x, y, t, i, s) => [0, ...s],
  1: (x, y, t, i, s) => [1, ...s],
  2: (x, y, t, i, s) => [2, ...s],
  3: (x, y, t, i, s) => [3, ...s],
  4: (x, y, t, i, s) => [4, ...s],
  5: (x, y, t, i, s) => [5, ...s],
  6: (x, y, t, i, s) => [6, ...s],
  7: (x, y, t, i, s) => [7, ...s],
  8: (x, y, t, i, s) => [8, ...s],
  9: (x, y, t, i, s) => [9, ...s],
  a: (x, y, t, i, s) => [10, ...s],
  b: (x, y, t, i, s) => [11, ...s],
  c: (x, y, t, i, s) => [12, ...s],
  d: (x, y, t, i, s) => [13, ...s],
  e: (x, y, t, i, s) => [14, ...s],
  f: (x, y, t, i, s) => [15, ...s],
};

function _eval(expr, x, y, t, i) {
  return [...expr].reduce((stack, token) => {
    return lookup[token]?.(x, y, t, i, stack);
  }, []);
}

function render(t) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const [value] = _eval(data.expr, i, j, t, i * SIZE + j);
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
