canvas = $("#c")[0]
canvas.width  = $("#c").parent().width()
canvas.height = $("#c").parent().height()

# require("draw")
# require("manipulate")



require("draw")
require("touch")




# shader = require("shader")

# vertexSrc = """
# precision mediump float;

# attribute vec3 vertexPosition;
# varying vec2 position;

# void main() {
#   gl_Position = vec4(vertexPosition, 1.0);
#   position = (vertexPosition.xy + 1.0) * 0.5;
# }
# """

# fragmentSrc = """
# precision mediump float;

# varying vec2 position;
# uniform sampler2D image;

# void main() {
#   gl_FragColor.r = position.x;
#   gl_FragColor.g = texture2D(image, position).g;
#   gl_FragColor.b = position.y;
#   gl_FragColor.a = 1.0;
# }
# """

# canvas = $("#c")[0]
# canvas.width  = $("#c").parent().width()
# canvas.height = $("#c").parent().height()

# s = shader({
#   canvas: canvas
#   vertex: vertexSrc
#   fragment: fragmentSrc
# })

# setTimeout(->
#   s.draw({
#     uniforms: {
#       image: $("#totoro")[0]
#     }
#   })
# , 3000)
