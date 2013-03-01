canvas = $("#c")[0]


debug = ->
  $("#debug").html(JSON.stringify(touches))


touches = {}


document.addEventListener("touchstart", (e) ->
  for touch in e.changedTouches
    t = touches[touch.identifier] = {}
    t.x = touch.pageX
    t.y = touch.pageY
  debug()
, false)

document.addEventListener("touchend", (e) ->
  for touch in e.changedTouches
    delete touches[touch.identifier]
  debug()
, false)

document.addEventListener("touchmove", (e) ->
  for touch in e.changedTouches
    t = touches[touch.identifier]
    t.x = touch.pageX
    t.y = touch.pageY
  debug()
  e.preventDefault()
, false)

$("#debug").html("init!")



