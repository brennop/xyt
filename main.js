import "./style.css";

import "aframe"
import 'mind-ar/dist/mindar-image-aframe.prod.js';
import jsQR from "jsqr";

import { draw } from "./draw"; 

AFRAME.registerComponent('canvas-updater', {
  dependencies: ['geometry', 'material'],

  tick: function () {
    var el = this.el;
    var material;

    material = el.getObject3D('mesh').material;
    if (!material.map) { return; }
    material.map.needsUpdate = true;
  }
});

const main = document.querySelector("body");
main.innerHTML = `
<a-scene mindar-image="imageTargetSrc: targets.mind" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
  <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
  <a-assets position="0 0.1 0">
    <canvas id="canvas" width="256" height="256"></canvas>
  </a-assets>

  <a-entity mindar-image-target="targetIndex: 0">
    <a-entity geometry='primitive: plane'
              material='src: #canvas'
              position='0 0 0'
              rotation='0 0 0'
              canvas-updater>
  </a-entity>
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

pollVideo();
