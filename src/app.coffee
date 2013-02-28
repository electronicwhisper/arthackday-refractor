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
uniform sampler2D img;

void main() {
  gl_FragColor = texture2D(img, position);
}
"""

canvas = $("#c")[0]

s = shader({
  canvas: canvas
  vertex: vertexSrc
  fragment: fragmentSrc
  uniforms: {}
})


$("#totoro").on("load", (e) ->
  s.draw({
    uniforms: {
      img: $("#totoro")[0]
    }
  })
)