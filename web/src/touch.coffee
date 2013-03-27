
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




solveTouch = (touches) ->
  # touches is an array of {original: [x, y, 1], current: [x, y, 1]}
  # original should be in _local_ coordinates (i.e. original matrix already applied)
  # current should be in _event_ coordinates
  objective = (m) ->
    error = 0
    for touch in touches[0...3]
      currentLocal = toLocal(touch.current)
      currentLocal = numeric.dot(m, currentLocal)
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
  else if touches.length >= 3
    transform = solve(objective,
      ([a, b, c, d, x, y]) ->
        [[a, b, x],
         [c, d, y],
         [0,  0, 1]]
      , [1, 0, 0, 1, 0, 0]
    )

  return transform



getMatrix = ->
  if state.selected
    # state.selected.transform
    numeric.dot(state.selected.transform, state.globalTransform)
  else
    state.globalTransform
  # _.last(state.chain).transform

setMatrix = (m) ->
  if state.selected
    # state.selected.transform = m
    state.selected.transform = numeric.dot(m, numeric.inv(state.globalTransform))
  else
    state.globalTransform = m
  # _.last(state.chain).transform = m


convertToPolar = (v) ->
  r = Math.sqrt(v[0] * v[0] + v[1] * v[1])
  a = Math.atan2(v[1], v[0])
  return [r, a, 1]



toLocal = (v) ->
  v = numeric.dot(state.globalTransform, v)
  if state.selected
    if state.polarMode
      v = convertToPolar(v)
    v = numeric.dot(state.selected.transform, v)
  return v

applyMatrix = (m) ->
  if state.selected
    state.selected.transform = numeric.dot(m, state.selected.transform)
  else
    state.globalTransform = numeric.dot(m, state.globalTransform)






tracking = {}

debugCount = 0
debug = ->
  # debugCount++
  # $("#debug").html(debugCount + "<br>" + JSON.stringify(tracking))


update = (touches) ->
  # matrix = getMatrix()
  ids = []
  for touch in touches
    ids.push(touch.identifier)
    if t = tracking[touch.identifier]
      t.current = eventPosition(touch)
    else
      t = tracking[touch.identifier] = {}
      t.current = eventPosition(touch)
      # t.original = numeric.dot(matrix, t.current)
      t.original = toLocal(t.current)

  # Remove touches that have ended
  tracking = _.pick(tracking, ids)

  # Solve.
  transform = solveTouch(_.values(tracking))
  state.apply ->
    applyMatrix(transform)

  debug()


h = require("hammer")

h.on("drag touch", "#c", (e) ->
  touches = e.gesture.touches
  update(touches)
)
h.on("release", (e) ->
  touches = e.gesture.touches
  update(touches)
  if e.gesture.pointerType == Hammer.POINTER_MOUSE
    for touch in touches
      delete tracking[touch.identifier]
  debug()
  return false
)


$("#debug").html(JSON.stringify(bounds()))




angleIncrement = 0.02
scaleIncrement = 1.02
key(",", (e) ->
  s = Math.cos(angleIncrement)
  r = Math.sin(angleIncrement)
  m = [[s,  r, 0],
       [-r, s, 0],
       [0,  0, 1]]
  state.apply ->
    applyMatrix(m)
)
key(".", (e) ->
  s = Math.cos(-angleIncrement)
  r = Math.sin(-angleIncrement)
  m = [[s,  r, 0],
       [-r, s, 0],
       [0,  0, 1]]
  state.apply ->
    applyMatrix(m)
)
key("z", (e) ->
  s = scaleIncrement
  m = [[s, 0, 0],
       [0, s, 0],
       [0, 0, 1]]
  state.apply ->
    applyMatrix(m)
)
key("x", (e) ->
  s = 1/scaleIncrement
  m = [[s, 0, 0],
       [0, s, 0],
       [0, 0, 1]]
  state.apply ->
    applyMatrix(m)
)
