shader = require("shader")
state = require("state")
generate = require("generate")


vertexSrc = """
precision mediump float;

attribute vec3 vertexPosition;
varying vec2 position;

void main() {
  gl_Position = vec4(vertexPosition, 1.0);
  position = (vertexPosition.xy + 1.0) * 0.5;
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

$("#totoro").on("load", (e) ->
  s.draw({
    uniforms: {
      image: $("#totoro")[0]
      resolution: [canvas.width, canvas.height]
      imageResolution: [$("#totoro").width(), $("#totoro").height()]
    }
  })
)


state.watch(->
  _.pluck(state.chain, "transform")
, ->
  s.draw({
    uniforms: generate.uniforms()
  })
)


# state.watch()


# s.draw({
#   uniforms: generate.uniforms()
# })