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

const SIZE = 64;
const CANVAS_SIZE = 256;
const PIXEL_SIZE = CANVAS_SIZE / SIZE;
const RATIO = 16 / SIZE;

const data = {
  expr: "x y +",
}

// expr is a string that contains instructions to draw a pixel
// x and y push x and y coordinates to the stack
// t push the time to the stack
// +, -, *, /, %, ^, & and | are arithmetic operators
// 0-F push a number to the stack
// S, C, T are math functions
//
// this function returns the color of the pixel
function _eval(expr, x, y, t) {
  return [...expr].reduce((stack, token) => {
    switch (token) {
      case "x":
        stack.push(x * RATIO);
        break;
      case "y":
        stack.push(y * RATIO);
        break;
      case "t":
        stack.push(t / 1000);
        break;
      case "+":
        stack.push(stack.pop() + stack.pop());
        break;
      case "-":
        stack.push(stack.pop() - stack.pop());
        break;
      case "*":
        stack.push(stack.pop() * stack.pop());
        break;
      case "/":
        stack.push(stack.pop() / stack.pop());
        break;
      case "%":
        stack.push(stack.pop() % stack.pop());
        break;
      case "&":
        stack.push(stack.pop() & stack.pop());
        break;
      case "|":
        stack.push(stack.pop() | stack.pop());
        break;
      case "^":
        stack.push(stack.pop() ^ stack.pop());
      case "S":
        stack.push(Math.sin(stack.pop()));
      case "C":
        stack.push(Math.cos(stack.pop()));
      case "T":
        stack.push(Math.tan(stack.pop()));

      case " ":
        break;
      default:
        stack.push(parseInt(token, 16));
    } 

    return stack;
  }, []).pop();
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
