shader = require("shader")
state = require("state")



vertexSrc = """
precision mediump float;

attribute vec3 vertexPosition;
varying vec2 position;

void main() {
  gl_Position = vec4(vertexPosition, 1.0);
  position = (vertexPosition.xy + 1.0) * 0.5;
}
"""

fragmentSrc = """
precision mediump float;

varying vec2 position;
uniform sampler2D image;
uniform vec2 resolution;
uniform vec2 imageResolution;

uniform mat3 m1;
uniform mat3 m2;

void main() {
  vec3 p = vec3(position, 1.);

  //p = vec3(length(p.xy), atan(p.y / p.x), 1.);
  p = m1 * p;
  p.x = abs(p.x);
  p = m2 * p;
  //p = vec3(p.x * cos(p.y), p.x * sin(p.y), 1.);


  /*
  float ratio = resolution.x / resolution.y;
  float imageRatio = imageResolution.x / imageResolution.y;
  if (ratio > imageRatio) {
    p.x *= ratio / imageRatio;
    p.x -= (ratio - imageRatio) / 2.;
  } else {
    p.y -= (imageRatio - ratio) / 2.;
    p.y *= imageRatio / ratio;
  }
  */

  if (p.x < 0. || p.x > 1. || p.y < 0. || p.y > 1.) {
    // black if out of bounds
    gl_FragColor = vec4(0., 0., 0., 1.);
  } else {
    gl_FragColor = texture2D(image, p.xy);
  }
}
"""


canvas = $("#c")[0]
canvas.width  = $("#c").parent().width()
canvas.height = $("#c").parent().height()

s = shader({
  canvas: canvas
  vertex: vertexSrc
  fragment: fragmentSrc
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



flattenMatrix = (m) ->
  _.flatten(numeric.transpose(m))

draw = ->
  matrix = state.matrix
  s.draw({
    uniforms: {
      m1: flattenMatrix(matrix)
      m2: flattenMatrix(numeric.inv(matrix))
    }
  })
draw()


module.exports = draw