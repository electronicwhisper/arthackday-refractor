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


model = new ReactiveScope({
  distortions: distortions
  chain: []
  transform: numeric.identity(3)
})

model.chain.push({
  transform: numeric.identity(3)
  distortion: distortions[0]
})



module.exports = model