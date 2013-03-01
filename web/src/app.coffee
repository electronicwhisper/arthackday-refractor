_.reverse = (a) ->
  a.slice().reverse()


canvas = $("#c")[0]
canvas.width  = $("#c").parent().width()
canvas.height = $("#c").parent().height()

require("draw")
require("touch")



state = require("state")
$("#add").on("click", (e) ->
  state.apply ->
    state.chain.push({
      transform: numeric.identity(3)
      distortion: _.shuffle(state.distortions)[0]
    })
)