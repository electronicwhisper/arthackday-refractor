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

uniform mat3 m;

void main() {
  vec3 p = vec3(position, 1.);

  p = m * p;

  gl_FragColor = texture2D(img, p.xy);
}
"""

canvas = $("#c")[0]

matrix = [[2, 0, 0],
          [0, 1, 0],
          [0, 0, 1]]

flattenMatrix = (m) ->
  _.flatten(numeric.transpose(m))

s = shader({
  canvas: canvas
  vertex: vertexSrc
  fragment: fragmentSrc
  uniforms: {
    m: flattenMatrix(matrix)
  }
})
$("#totoro").on("load", (e) ->
  s.draw({
    uniforms: {
      img: $("#totoro")[0]
    }
  })
)

draw = ->
  s.draw({
    uniforms: {
      m: flattenMatrix(matrix)
    }
  })


localCoords = (e) ->
  $el = $(e.target)
  offset = $el.offset()
  width = $el.width()
  height = $el.height()

  x = (e.pageX - offset.left) / width
  y = 1 - (e.pageY - offset.top ) / height

  return [x, y]


$("#c").on("mousedown", (e) ->
  downPosition = localCoords(e)
  downMatrix = numeric.clone(matrix)

  move = (e) ->
    movePosition = localCoords(e)
    offset = numeric.sub(downPosition, movePosition)
    offsetMatrix = [[1, 0, offset[0]],
                    [0, 1, offset[1]],
                    [0, 0, 1]]
    matrix = numeric.dot(offsetMatrix, downMatrix)
    draw()

  up = (e) ->
    $(document).off("mousemove", move)
    $(document).off("mouseup", up)

  $(document).on("mousemove", move)
  $(document).on("mouseup", up)
)













