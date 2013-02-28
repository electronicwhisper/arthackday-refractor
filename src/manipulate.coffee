
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


solveTouch = (touches) ->
  # touches is an array of {original: [x, y, 1], current: [x, y, 1]}
  # original should be in _local_ coordinates
  # current should be in _event_ coordinates
  objective = (m) ->
    newMatrix = numeric.dot(m, state.matrix)
    error = 0
    for touch in touches
      currentLocal = numeric.dot(newMatrix, touch.current)
      error += dist(touch.original, currentLocal)
    return error

  if touches.length == 1
    transform = solve(objective,
      ([x, y]) ->
        [[1, 0, x],
         [0, 1, y],
         [0, 0, 1]]
      , [0, 0]
    )
  else if touches.length == 2
    transform = solve(objective,
      ([s, r, x, y]) ->
        [[s,  r, x],
         [-r, s, y],
         [0,  0, 1]]
      , [1, 0, 0, 0]
    )

  state.matrix = numeric.dot(transform, state.matrix)



lastPosition = false
lastLocal = false

$("#c").on("mousedown", (e) ->
  downPosition = eventPosition(e)
  downLocal = numeric.dot(state.matrix, downPosition)
  if !key.shift
    $(".touch-hint").css({display: "none"})

  move = (e) ->
    movePosition = eventPosition(e)

    if key.shift
      solveTouch([
        {original: downLocal, current: movePosition}
        {original: lastLocal, current: lastPosition}
      ])
    else
      solveTouch([
        {original: downLocal, current: movePosition}
      ])

    draw()

  up = (e) ->
    lastPosition = eventPosition(e)
    lastLocal = numeric.dot(state.matrix, lastPosition)
    placeTouchHint()

    $(document).off("mousemove", move)
    $(document).off("mouseup", up)

  $(document).on("mousemove", move)
  $(document).on("mouseup", up)

  e.preventDefault()
  return true
)




placeTouchHint = ->
  $el = $("#c")
  offset = $el.offset()
  width = $el.width()
  height = $el.height()

  x = lastPosition[0]       * width  + offset.left
  y = (1 - lastPosition[1]) * height + offset.top

  $(".touch-hint").css({
    display: "block"
    left: x
    top: y
  })