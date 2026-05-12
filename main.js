import vertexShaderSrc from '/vertex.glsl.js';
import fragmentShaderSrc from '/fragment.glsl.js';

function accessWebcam(video) {
  return new Promise((resolve, reject) => {
    const mediaConstraints = { audio: false, video: true
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

function create(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
  return shader;
};

async function initialize() {
  // https://dev.to/learosema/realtime-video-processing-with-webgl-5653
  const canvas = document.querySelector('canvas');
  canvas.width = canvas.clientWidth * 2.2;
  canvas.height = canvas.clientHeight * 2.2;
  const gl = canvas.getContext('webgl2');

  const video = document.querySelector('video');
  await accessWebcam(video);

  const program = gl.createProgram();
  gl.attachShader(program, create(gl, gl.VERTEX_SHADER, vertexShaderSrc));
  gl.attachShader(program, create(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'position');

  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(program, 'texture0'), 0);

  const uRes = gl.getUniformLocation(program, 'u_resolution');
  gl.uniform2f(uRes, canvas.width, canvas.height);

  function render() {
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
};

window.onload = initialize;