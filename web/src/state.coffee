ReactiveScope = require("ReactiveScope")

distortions = [
  {
    title: "Reflect"
    f:     "p.x = abs(p.x)"
  }
  {
    title: "Repeat"
    f:     "p.x = fract(p.x)"
  }
  {
    title: "Clamp"
    f:     "p.x = min(p.x, 0.)"
  }
  {
    title: "Step"
    f:     "p.x = floor(p.x)"
  }
  {
    title: "Sine"
    f:     "p.x = sin(p.x)"
  }
]


state = new ReactiveScope({
  distortions: distortions
  chain: []
  selected: false
  transform: numeric.identity(3)
})

state.watch("selected", "chain", ->
  if state.selected && !_.contains(state.chain, state.selected)
    state.selected = false
)



module.exports = state