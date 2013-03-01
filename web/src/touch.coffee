
solve = require("solve")
state = require("state")
bounds = require("bounds")


dist = (p1, p2) ->
  d = numeric['-'](p1, p2)
  numeric.dot(d, d)

lerp = (x, min, max) ->
  min + x * (max - min)

eventPosition = (e) ->
  $el = $("#c")
  offset = $el.offset()
  width = $el.width()
  height = $el.height()

  # Scaled from 0 to 1
  x =     (e.pageX - offset.left) / width
  y = 1 - (e.pageY - offset.top ) / height

  b = bounds()
  x = lerp(x, b.boundsMin[0], b.boundsMax[0])
  y = lerp(y, b.boundsMin[1], b.boundsMax[1])

  return [x, y, 1]




solveTouch = (touches, matrix) ->
  # touches is an array of {original: [x, y, 1], current: [x, y, 1]}
  # original should be in _local_ coordinates (i.e. original matrix already applied)
  # current should be in _event_ coordinates
  objective = (m) ->
    newMatrix = numeric.dot(m, matrix)
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

  return numeric.dot(transform, matrix)



getMatrix = ->
  _.last(state.chain).transform

setMatrix = (m) ->
  _.last(state.chain).transform = m



tracking = {}

debug = ->
  $("#debug").html(JSON.stringify(tracking))


update = (touches) ->
  matrix = getMatrix()
  ids = []
  for touch in touches
    ids.push(touch.identifier)
    if t = tracking[touch.identifier]
      t.current = eventPosition(touch)
    else
      t = tracking[touch.identifier] = {}
      t.current = eventPosition(touch)
      t.original = numeric.dot(matrix, t.current)

  # Remove touches that have ended
  tracking = _.pick(tracking, ids)

  # Solve.
  newMatrix = solveTouch(_.values(tracking), matrix)
  state.apply ->
    setMatrix(newMatrix)

  debug()


h = Hammer($("#c")[0], {drag_max_touches:0})

h.on("drag touch", (e) ->
  touches = e.gesture.touches
  update(touches)

  e.gesture.preventDefault()
)
h.on("release", (e) ->
  touches = e.gesture.touches
  for touch in touches
    delete tracking[touch.identifier]
)


$("#debug").html(JSON.stringify(bounds()))



