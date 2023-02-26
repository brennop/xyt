import "./style.css";

import "aframe"
import "@ar-js-org/ar.js/aframe/build/aframe-ar";

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
        <a-scene embedded arjs='sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;'>
          <a-assets position="0 0.5 0">
            <canvas id="canvas" width="256" height="256"></canvas>
          </a-assets>

          <a-marker type='barcode' value='16'>
            <a-entity geometry='primitive: plane'
                      material='src: #canvas'
                      position='0 0 0'
                      rotation='-90 0 0'
                      canvas-updater>
            </a-entity>
          </a-marker>
          <a-entity camera></a-entity>
        </a-scene>
`

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const expr = "xy+t+";

function render(t) {
  draw(ctx, expr, t);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
