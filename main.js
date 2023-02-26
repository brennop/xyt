import "./style.css";

import "aframe"
import "@ar-js-org/ar.js/aframe/build/aframe-ar";

import { draw } from "./draw";
import jsQR from "jsqr";

AFRAME.registerComponent('canvas-updater', {
  dependencies: ['geometry', 'material'],

  tick: function() {
    var el = this.el;
    var material;

    material = el.getObject3D('mesh').material;
    if (!material.map) { return; }
    material.map.needsUpdate = true;
  }
});

const main = document.querySelector("body");
main.innerHTML = `
        <a-scene embedded arjs='sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;'>
          <a-assets position="0 0 0">
            <canvas id="canvas" width="256" height="256"></canvas>
          </a-assets>

          <a-marker type='pattern' url='pattern.patt'>
            <a-entity geometry='primitive: plane'
                      material='src: #canvas'
                      position='0 0 0'
                      rotation='-90 0 0'
                      scale='3 3 3'
                      canvas-updater>
            </a-entity>
          </a-marker>
          <a-entity camera></a-entity>
        </a-scene>
`

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const url = new URL(window.location);
let expr = url.pathname.slice(1, 24);
if (!expr) {
  window.history.pushState({}, "", "/xy+");
  expr = "xy+";
}

let video = null;
const videoCanvas = document.createElement("canvas");

function render(t) {
  draw(ctx, expr, t);

  if (video) {
    try {
      // get the video frame
      videoCanvas.width = video.videoWidth;
      videoCanvas.height = video.videoHeight;
      videoCanvas.getContext("2d").drawImage(video, 0, 0);
      const imageData = videoCanvas.getContext("2d").getImageData(0, 0, video.videoWidth, video.videoHeight);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        expr = code.data;
      }
    } catch (e) {
      console.log(e);
    }
  }

  requestAnimationFrame(render);
}

requestAnimationFrame(render);

// poll for video
function pollVideo() {
  if (video) {
    return;
  }
  video = document.querySelector("video");
  if (video) {
    console.log("video found");
  } else {
    setTimeout(pollVideo, 100);
  }
}

pollVideo();
