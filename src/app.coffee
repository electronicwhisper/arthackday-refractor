shader = require("shader")
solve = require("solve")

dist = (p1, p2) ->
  d = numeric['-'](p1, p2)
  numeric.dot(d, d)




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
  //p.x = mod(p.x, .5);
  //p = m2 * p;

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
      m1: flattenMatrix(matrix)
      m2: flattenMatrix(numeric.inv(matrix))
    }
  })
draw()

eventPosition = (e) ->
  $el = $("#c")
  offset = $el.offset()
  width = $el.width()
  height = $el.height()

  x = (e.pageX - offset.left) / width
  y = 1 - (e.pageY - offset.top ) / height

  return [x, y, 1]


$("#c").on("mousedown", (e) ->
  downPosition = eventPosition(e)
  downLocal = numeric.dot(matrix, downPosition)

  move = (e) ->
    movePosition = eventPosition(e)

    transform = solve(
      (m) ->
        newMatrix = numeric.dot(m, matrix)
        moveLocal = numeric.dot(newMatrix, movePosition)
        dist(moveLocal, downLocal)
      , ([x, y]) ->
        [[1, 0, x],
         [0, 1, y],
         [0, 0, 1]]
      , [0, 0]
    )

    matrix = numeric.dot(transform, matrix)

    draw()

  up = (e) ->
    $(document).off("mousemove", move)
    $(document).off("mouseup", up)

  $(document).on("mousemove", move)
  $(document).on("mouseup", up)
)









