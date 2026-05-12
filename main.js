import vertexShaderSrc from 'vertex.glsl.js';
import fragmentShaderSrc from 'fragment.glsl.js';

function accessWebcam(video) {
  return new Promise((resolve, reject) => {
    const mediaConstraints = { audio: false, video: {
      width: 1280,
      height: 720,
      brightness: {ideal: 2}
    }
  };

  navigator.mediaDevices.getUserMedia(
    mediaConstraints).then(mediaStream => {
      video.srcObject = mediaStream;
      video.setAttribute('playsinline', true);
      video.onloadedmetadata = (e) => {
        video.play();
        resolve(video);
      }
    }).catch(err => {
      reject(err);
    });
  });
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(img);
    };
  });
};

function initialize() {
  console.log("Starting");
  // https://dev.to/learosema/realtime-video-processing-with-webgl-5653
  const canvas = document.querySelector('canvas');
  canvas.width = canvas.clientWidth;
  canvas.heigh = canvas.clientHeight;
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + textureIndex);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, video);

};

window.onload = initialize();