_.reverse = (a) ->
  a.slice().reverse()


canvas = $("#c")[0]
canvas.width  = $("#c").parent().width()
canvas.height = $("#c").parent().height()

require("draw")
require("touch")



state = require("state")
$(document).on("click", ".button-add", (e) ->
  state.apply ->
    c = {
      transform: numeric.identity(3)
      distortion: _.shuffle(state.distortions)[0]
    }
    state.chain.push(c)
    state.selected = c
  return false
)
$(document).on("click", ".button-remove", (e) ->
  c = ko.dataFor(this)
  state.apply ->
    state.chain = _.without(state.chain, c)
  return false
)
$(document).on("click", ".distortion", (e) ->
  c = ko.dataFor(this)
  state.apply ->
    state.selected = c
  return false
)
$(document).on("click", "#sidebar", (e) ->
  state.apply ->
    state.selected = false
)




koState = ko.observable()
koUpdate = ->
  koState(state)
koUpdate()
state.watch("chain", "selected", ->
  koUpdate()
)

ko.applyBindings({koState: koState})