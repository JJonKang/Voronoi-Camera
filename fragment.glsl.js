// Inspiration taken from:
// thebookofshaders website: https://thebookofshaders.com/
// https://gist.github.com/JoonTorareta/276a5ec205cd1795916beda49625cbf7
// patriciogv's voronoi noise function within thebookofshaders
export default `#version 300 es
precision mediump float;
uniform sampler2D texture0;
uniform vec2 u_resolution;
uniform float u_time;

uniform float cellCount; //cell count
uniform float pixelSize; //size of pixel
uniform float blurCount; // blur sample count
uniform float blurSpread; // blur spread radius
uniform float animationSpeed; //speed of the voronoi patterns' rotation
uniform float brightness; //brightness

out vec4 fragColor;

vec2 random(vec2 c) {
  return fract(sin(vec2(dot(c,vec2(127.1,311.7)),dot(c,vec2(269.5,183.3))))*43758.5453);
}

// light thresholds for voronoi determination
float light1 = 0.4;
float light2 = 0.6;
float light3 = 0.75;
float light4 = 0.9;

vec3 surroundPixel(vec2 uv) {
  vec2 uvs[8]; // the neighboring pixels
  uvs[0] = vec2(1.0 / u_resolution.x, 0.0); //right
  uvs[1] = vec2(-1.0 / u_resolution.x, 0.0); //left
  uvs[2] = vec2(0.0, 1.0 / u_resolution.y); //up
  uvs[3] = vec2(0.0, -1.0 / u_resolution.y); //down
  uvs[4] = vec2(1.0 / u_resolution.x, 1.0 / u_resolution.y); //up-right
  uvs[5] = vec2(1.0 / u_resolution.x, -1.0 / u_resolution.y); //down-right
  uvs[6] = vec2(-1.0 / u_resolution.x, 1.0 / u_resolution.y); //up-left
  uvs[7] = vec2(-1.0 / u_resolution.x, -1.0 / u_resolution.y); //down-left)

  vec3 color = texture(texture0, uv).rgb;
  for(int i = 0; i < int(blurCount * 8.0); i++){
    color += texture(texture0, clamp(uv + blurSpread * uvs[int(mod(float(i), 8.0))] * (float(i) / 8.0), 0.0, 1.0)).rgb;
  }
  color /= blurCount * 8.0 + 1.0;
  return color;
}

void main() {
  vec2 uv = floor(gl_FragCoord.xy / pixelSize) * pixelSize / u_resolution;
  uv.y = 1.0 - uv.y;
  vec3 color = surroundPixel(uv);

  vec3 camSeed = texture(texture0, uv).rgb;
  // voronoi now based on camera vision
  vec2 st = (uv + camSeed.rg * 0.05) * cellCount;
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);
  float m_dist = 10.0; //min distance
  vec2 m_point = vec2(0.0, 0.0); //min point

  for (int j=-1; j<=1; j++ ) {
    for (int i=-1; i<=1; i++ ) {
      vec2 neighbor = vec2(float(i),float(j));
      vec2 point = random(i_st + neighbor);
      point = 0.5 + animationSpeed * sin(u_time + 6.2831*point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);

      if( dist < m_dist ) {
        m_dist = dist;
        m_point = point;
      }
    }
  }

  vec4 cam = texture(texture0, uv + vec2(m_dist) * 0.0215);
  float brightness = length(color) / pow(1.1, 0.5) * brightness;
  //change the 2nd element in vec2(0.3, __) for how dark each cell should be
  if(length(color) > light4 * pow(3.0, 0.5)){
    fragColor = vec4(cam.rgb * dot(m_point, vec2(0.17, 0.3)) * brightness, 1.0);
  }
  else if(length(color) > light3 * pow(3.0, 0.5)){
    fragColor = vec4(cam.rgb * dot(m_point, vec2(0.20, 0.4)) * brightness, 1.0);
  }
  else if(length(color) > light2 * pow(3.0, 0.5)){
    fragColor = vec4(cam.rgb * dot(m_point, vec2(0.23, 0.5)) * brightness, 1.0);
  }
  else if(length(color) > light1 * pow(3.0, 0.5)){
    fragColor = vec4(cam.rgb * dot(m_point, vec2(0.26, 0.6)) * brightness, 1.0);
  }
  else{
    fragColor = vec4(cam.rgb * dot(m_point, vec2(0.3, 0.8)) * brightness, 1.0);
  }

}
`;