
solve = require("solve")
state = require("state")
draw = require("draw")


dist = (p1, p2) ->
  d = numeric['-'](p1, p2)
  numeric.dot(d, d)

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
  downLocal = numeric.dot(state.matrix, downPosition)

  move = (e) ->
    movePosition = eventPosition(e)

    transform = solve(
      (m) ->
        newMatrix = numeric.dot(m, state.matrix)
        moveLocal = numeric.dot(newMatrix, movePosition)
        dist(moveLocal, downLocal)
      , ([x, y]) ->
        [[1, 0, x],
         [0, 1, y],
         [0, 0, 1]]
      , [0, 0]
    )

    state.matrix = numeric.dot(transform, state.matrix)

    draw()

  up = (e) ->
    $(document).off("mousemove", move)
    $(document).off("mouseup", up)

  $(document).on("mousemove", move)
  $(document).on("mouseup", up)
)









