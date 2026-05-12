#version 300 es
precision mediump float;
uniform sampler2D texture0;
uniform vec2 u_resolution;

out vec4 gl_FragColor;

void main() {
  vec2 coord = 1.0 - gl_FragCoord.xy / u_resolution;
  gl_FragColor = texture(texture0, coord);
};