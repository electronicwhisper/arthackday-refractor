shader = require("shader")
state = require("state")
generate = require("generate")
bounds = require("bounds")


vertexSrc = """
precision mediump float;

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

# $("#totoro").on("load", (e) ->
#   s.draw({
#     uniforms: {
#       image: $("#totoro")[0]
#       resolution: [canvas.width, canvas.height]
#       imageResolution: [$("#totoro").width(), $("#totoro").height()]
#     }
#   })
# )
setTimeout(->
  s.draw({
    uniforms: {
      image: $("#totoro")[0]
      resolution: [canvas.width, canvas.height]
      imageResolution: [$("#totoro").width(), $("#totoro").height()]
    }
  })
, 500)


state.watch(->
  _.pluck(state.chain, "transform")
, ->
  s.draw({
    uniforms: generate.uniforms()
  })
)
