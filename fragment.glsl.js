export default `#version 300 es
precision mediump float;
uniform sampler2D texture0;
uniform vec2 u_resolution;

out vec4 fragColor;

void main() {
  vec2 coord = 1.0 - gl_FragCoord.xy / u_resolution;
  fragColor = texture(texture0, coord);
}
`;