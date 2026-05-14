// Project: Voronoi Shader with Camera using WebGL/GLSL
// Author: Jonathan Kang
// Main Focus: The intent behind this project is...
// 1) To enable a webcamera for WebGL.
// 2) To implement shaders into the data obtained from the webcamera
// 2b) This would mean that half of this project would be to work on
//     the fragment shaders.

import vertexShaderSrc from './vertex.glsl.js';
import fragmentShaderSrc from './fragment.glsl.js';

let cellCount = 20.0;
let pixelSize = 2.0;
let blurCount = 5.0;
let blurSpread = 3.0;
let animationSpeed = 0.75;
let brightness = 1.4;

//////////////////////////////////////////////
// Camera Permission
function accessWebcam(camera) {
  // wait until permission is granted
  return new Promise((resolve, reject) => {
    // camera details
    const mediaConstraints = {
      audio: 0,
      video: 1
    };

    // make sure you get permission to record with the camera
    navigator.mediaDevices.getUserMedia(
      mediaConstraints).then(mediaStream => {
        camera.srcObject = mediaStream;
        camera.setAttribute('playsinline', true);
        camera.onloadedmetadata = (e) => {
          camera.play();
          resolve(camera);
        }
      }).catch(err => { reject(err); });
  });
};

//////////////////////////////////////////////
// OPTIONS:
// Cell Count
window.setCellCount = function(){
  cellCount = parseFloat(document.getElementById('cell-count').value);
}
// Pixel Size
window.setPixelSize = function(){
  pixelSize = parseFloat(document.getElementById('pixel-size').value);
}
// Blur Size
window.setBlurSample = function(){
  blurCount = parseFloat(document.getElementById('blur-sample').value);
}
// Blur Spread Radius
window.setBlurSpread = function(){
  blurSpread = parseFloat(document.getElementById('blur-spread').value);
}
// Animation Speed
window.setAnimationSpeed = function(){
  animationSpeed = parseFloat(document.getElementById('animation-speed').value);
}
// Brightness
window.setBrightness = function(){
  brightness = parseFloat(document.getElementById('brightness').value);
}

//////////////////////////////////////////////
// Initialization
// +
// Rendering
async function initialize() {
  // https://dev.to/learosema/realtime-video-processing-with-webgl-5653
  // https://stackoverflow.com/questions/56639762/manipulate-a-webcam-stream-as-a-webgl-texture

  // screen setup
  const canvas = document.querySelector('canvas');
  canvas.width = canvas.clientWidth * 2.5;
  canvas.height = canvas.clientHeight * 2.5;
  const gl = canvas.getContext('webgl2');
  gl.viewport(0, 0, canvas.width, canvas.height);

  // camera setup
  const camera = document.getElementById('camera');
  await accessWebcam(camera);

  // create vertex shader
  const vshader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vshader, vertexShaderSrc);
  gl.compileShader(vshader);
  if(!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(vshader));
  }

  // create fragment shader
  const fshader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fshader, fragmentShaderSrc);
  gl.compileShader(fshader);
  if(!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fshader));
  }

  // create and link program
  const program = gl.createProgram();
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  gl.linkProgram(program);
  gl.useProgram(program);

  // options setup
  const uCellCount = gl.getUniformLocation(program, 'cellCount');
  const uPixelSize = gl.getUniformLocation(program, 'pixelSize');
  const uBlurCount = gl.getUniformLocation(program, 'blurCount');
  const uBlurSpread = gl.getUniformLocation(program, 'blurSpread');
  const uAnimationSpeed = gl.getUniformLocation(program, 'animationSpeed');
  const uBrightness = gl.getUniformLocation(program, 'brightness');

  // create buffer vertices
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // texture for camera data
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // bind texture to "data" of fragment
  gl.uniform1i(gl.getUniformLocation(program, 'texture0'), 0);
  const uRes = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(uRes, canvas.width, canvas.height);

  // continually renders camera details
  function render(t) {
    // so that it won't break down before everything loads
    if (camera.readyState >= camera.HAVE_CURRENT_DATA) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, camera);
    }
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), t * 0.001);
    gl.uniform1f(uCellCount, cellCount);
    gl.uniform1f(uPixelSize, pixelSize);
    gl.uniform1f(uBlurCount, blurCount);
    gl.uniform1f(uBlurSpread, blurSpread);
    gl.uniform1f(uAnimationSpeed, animationSpeed);
    gl.uniform1f(uBrightness, brightness);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
};

window.onload = initialize;