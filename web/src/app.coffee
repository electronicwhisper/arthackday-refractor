_.reverse = (a) ->
  a.slice().reverse()


canvas = $("#c")[0]
canvas.width  = $("#c").parent().width()
canvas.height = $("#c").parent().height()

require("draw")
require("touch")









imageCount = 2

state = require("state")

h = $("#sidebar").hammer()
h.on("tap", ".button-add", (e) ->
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
h.on("tap", ".button-remove", (e) ->
  c = ko.dataFor(this)
  state.apply ->
    state.chain = _.without(state.chain, c)
  return false
)
h.on("tap", ".distortion", (e) ->
  c = ko.dataFor(this)
  state.apply ->
    state.selected = c
  return false
)
h.on("tap", (e) ->
  state.apply ->
    state.selected = false
  return false
)

changeImage = (d) ->
  state.apply ->
    state.image += d
    state.image = (state.image + imageCount) % imageCount
h.on("tap", ".button-image-prev", (e) ->
  changeImage(-1)
  return false
)
h.on("tap", ".button-image-next", (e) ->
  changeImage(1)
  return false
)

h.on("tap", ".button-reset", (e) ->
  state.apply ->
    state.chain = []
    state.globalTransform = numeric.identity(3)
  return false
)





koState = ko.observable()
koUpdate = ->
  koState(state)
koUpdate()
state.watch("chain", "selected", "image", ->
  koUpdate()
)

ko.applyBindings({koState: koState})