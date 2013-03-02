_.reverse = (a) ->
  a.slice().reverse()



$c = $("#c")
canvas = $c[0]
parentWidth  = $c.parent().width()
parentHeight = $c.parent().height()
$c.css({
  width: parentWidth + "px"
  height: parentHeight + "px"
})
canvas.width  = parentWidth  * 2
canvas.height = parentHeight * 2

require("draw")
require("touch")









imageCount = 11

state = require("state")
hammer = require("hammer")

lastAction = 0
threshold = 600
onclick = (selector, callback) ->
  hammer.on("touch", selector, callback)


onclick(".button-add", (e) ->
  distortion = ko.dataFor(this)
  state.apply ->
    c = {
      # transform: numeric.identity(3)
      transform: numeric.inv(state.globalTransform)
      distortion: distortion
    }
    state.chain.push(c)
    state.selected = c
  return false
)
onclick(".button-remove", (e) ->
  c = ko.dataFor(this)
  state.apply ->
    state.chain = _.without(state.chain, c)
  return false
)
onclick(".distortion", (e) ->
  c = ko.dataFor(this)
  state.apply ->
    state.selected = c
  return false
)
onclick("#sidebar", (e) ->
  state.apply ->
    state.selected = false
  return false
)

changeImage = (d) ->
  state.apply ->
    state.image += d
    state.image = (state.image + imageCount) % imageCount
onclick(".button-image-prev", (e) ->
  changeImage(-1)
  return false
)
onclick(".button-image-next", (e) ->
  changeImage(1)
  return false
)

onclick(".button-reset", (e) ->
  state.apply ->
    state.chain = []
    state.globalTransform = numeric.identity(3)
  return false
)





koState = ko.observable()
koUpdate = ->
  # console.log "ko state update"
  koState(state)
koUpdate()
state.watch((-> state.selected?.distortion), "image", (-> _.pluck(state.chain, "distortion")), ->
  koUpdate()
)

ko.applyBindings({koState: koState})