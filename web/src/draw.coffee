shader = require("shader")
state = require("state")
generate = require("generate")
bounds = require("bounds")


vertexSrc = """
precision highp float;

attribute vec3 vertexPosition;
varying vec2 position;
uniform vec2 boundsMin;
uniform vec2 boundsMax;

void main() {
  gl_Position = vec4(vertexPosition, 1.0);
  position = mix(boundsMin, boundsMax, (vertexPosition.xy + 1.0) * 0.5);
}
"""

fragmentSrc = generate.code()

canvas = $("#c")[0]
canvas.width  = $("#c").parent().width()
canvas.height = $("#c").parent().height()

s = shader({
  canvas: canvas
  vertex: vertexSrc
  fragment: generate.code()
  uniforms: generate.uniforms()
})

s.set({uniforms: require("bounds")()})

image = new Image()
setImage = (src) ->
  image.src = src
  image.onload = ->
    s.draw({
      uniforms: {
        image: image
        resolution: [canvas.width, canvas.height]
        imageResolution: [image.width, image.height]
      }
    })

# setImage("spirited_away.jpg")
setImage("images/#{0}.jpg")

state.watch("globalTransform", ->
  _.pluck(state.chain, "transform")
, ->
  s.draw({
    uniforms: generate.uniforms()
  })
)

state.watch(->
  _.pluck(state.chain, "distortion")
, ->
  s.draw({
    fragment: generate.code()
    uniforms: generate.uniforms()
  })
)