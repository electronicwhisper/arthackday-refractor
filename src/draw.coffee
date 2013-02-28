shader = require("shader")
state = require("state")



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

uniform mat3 m1;
uniform mat3 m2;

void main() {
  vec3 p = vec3(position, 1.);

  p = m1 * p;
  p.x = abs(p.x);
  p = m2 * p;

  gl_FragColor = texture2D(img, p.xy);
}
"""



s = shader({
  canvas: $("#c")[0]
  vertex: vertexSrc
  fragment: fragmentSrc
})

$("#totoro").on("load", (e) ->
  s.draw({
    uniforms: {
      img: $("#totoro")[0]
    }
  })
)



flattenMatrix = (m) ->
  _.flatten(numeric.transpose(m))

draw = ->
  matrix = state.matrix
  s.draw({
    uniforms: {
      m1: flattenMatrix(matrix)
      m2: flattenMatrix(numeric.inv(matrix))
    }
  })
draw()


module.exports = draw