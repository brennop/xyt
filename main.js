import "./style.css";
import QRCode from "qrcode";

import jsQR from "jsqr";
import createREGL from "regl";

import { draw } from "./draw"

const artCanvas = document.querySelector(".canvas");
const context = artCanvas.getContext("2d");
const input = document.querySelector(".input");

const url = new URL(window.location);
let expr = url.pathname.slice(1, 24);
if (!expr) {
  window.history.pushState({}, "", "/xy+");
  expr = "xy+";
}

input.value = expr;

const data = {
  expr,
  points: [[1, 0], [0, 0], [1, 1], [0, 0]],
};

let output = "art";

const video = document.querySelector("video");
const videoCanvas = document.createElement("canvas");
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: "environment",
  }
}).then((stream) => {
  video.srcObject = stream;
  video.setAttribute("playsinline", true);
  video.play();
  requestAnimationFrame(render);
});

const regl = createREGL();

const drawTriangle = regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }`,

  vert: `
    precision mediump float;
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0, 1);
    }`,

  attributes: {
    position: regl.prop("points"),
  },

  uniforms: {
    color: [1, 0, 0, 1]
  },

  count: 3
});


function render(t) {
  if (output === "art") {
    draw(context, data.expr, t);
  } else if (output === "qrcode") {
    QRCode.toCanvas(artCanvas, data.expr, {
      margin: 5,
      width: CANVAS_SIZE,
    });
  }

  try {
    // get the video frame
    videoCanvas.width = video.videoWidth;
    videoCanvas.height = video.videoHeight;
    videoCanvas.getContext("2d").drawImage(video, 0, 0);
    const imageData = videoCanvas.getContext("2d").getImageData(0, 0, video.videoWidth, video.videoHeight);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      data.expr = code.data;

      data.points = [
        [code.location.topLeftCorner.x / video.videoWidth, code.location.topLeftCorner.y / video.videoHeight],
        [code.location.topRightCorner.x / video.videoWidth, code.location.topRightCorner.y / video.videoHeight],
        [code.location.bottomRightCorner.x / video.videoWidth, code.location.bottomRightCorner.y / video.videoHeight],
        [code.location.bottomLeftCorner.x / video.videoWidth, code.location.bottomLeftCorner.y / video.videoHeight],
      ].map(([x, y]) => [x * 2 - 1, y * -2 + 1]);
    }
  } catch (e) {
    console.log(e);
  }

  // draw two triangles to form a quad
  drawTriangle({
    points: [data.points[0], data.points[1], data.points[2]],
  });
  drawTriangle({
    points: [data.points[0], data.points[2], data.points[3]],
  });


  requestAnimationFrame(render);
}

// rerender on input change
input.addEventListener("input", () => {
  data.expr = input.value;
});

artCanvas.addEventListener("click", () => {
  output = output === "art" ? "qrcode" : "art";
});
