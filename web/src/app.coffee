_.reverse = (a) ->
  a.slice().reverse()





Hammer.gestures.Any = {
    name: 'any'
    index: 10
    defaults: {}
    handler: (ev, inst) ->
      inst.trigger("any", ev)
};

Hammer.gestures.Down = {
  name: 'down'
  index: 100
  defaults: {}
  handler: (ev, inst) ->
    if ev.eventType == Hammer.EVENT_START
      inst.trigger(this.name, ev)
}





canvas = $("#c")[0]
canvas.width  = $("#c").parent().width()
canvas.height = $("#c").parent().height()

require("draw")
require("touch")









imageCount = 5

state = require("state")

# h = $("#sidebar").hammer({
#   tap_max_touchtime  : Infinity
#   tap_max_distance   : 30
# })
hammer = require("hammer")

lastAction = 0
threshold = 600
onclick = (selector, callback) ->
  hammer.on("touch", selector, callback)

  # $(document).on("click", selector, callback)

  # hammer.on("tap", selector, (e) ->
  #   result = false
  #   now = Date.now()
  #   if now > lastAction + threshold
  #     result = callback.call(this, e)
  #     lastAction = now
  #   return result
  # )


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