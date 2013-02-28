shader = require("shader")



vertexSrc = """
precision mediump float;

attribute vec3 vertexPosition;
varying vec2 position;

void main() {
  gl_Position = vec4(vertexPosition, 1.0);
  position = (vertexPosition.xy + 1.0) * 0.5;
}
"""

fragmentSrc = """
precision mediump float;

varying vec2 position;

void main() {
  gl_FragColor.r = position.x;
  gl_FragColor.g = position.y;
  gl_FragColor.b = 0.0;
  gl_FragColor.a = 1.0;
}
"""

canvas = $("#c")[0]

s = shader({
  canvas: canvas
  vertex: vertexSrc
  fragment: fragmentSrc
  uniforms: {}
})
s.draw()