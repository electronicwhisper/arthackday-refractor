
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), module = cache[path], fn;
      if (module) {
        return module.exports;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: path, exports: {}};
        try {
          cache[path] = module;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return module.exports;
        } catch (err) {
          delete cache[path];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"app": function(exports, require, module) {(function() {
  var canvas, dist, draw, eventPosition, flattenMatrix, fragmentSrc, matrix, s, shader, solve, vertexSrc;

  shader = require("shader");

  solve = require("solve");

  dist = function(p1, p2) {
    var d;
    d = numeric['-'](p1, p2);
    return numeric.dot(d, d);
  };

  vertexSrc = "precision mediump float;\n\nattribute vec3 vertexPosition;\nvarying vec2 position;\n\nvoid main() {\n  gl_Position = vec4(vertexPosition, 1.0);\n  position = (vertexPosition.xy + 1.0) * 0.5;\n}";

  fragmentSrc = "precision mediump float;\n\nvarying vec2 position;\nuniform sampler2D img;\n\nuniform mat3 m1;\nuniform mat3 m2;\n\nvoid main() {\n  vec3 p = vec3(position, 1.);\n\n  p = m1 * p;\n  //p.x = mod(p.x, .5);\n  //p = m2 * p;\n\n  gl_FragColor = texture2D(img, p.xy);\n}";

  canvas = $("#c")[0];

  matrix = [[2, 0, 0], [0, 1, 0], [0, 0, 1]];

  flattenMatrix = function(m) {
    return _.flatten(numeric.transpose(m));
  };

  s = shader({
    canvas: canvas,
    vertex: vertexSrc,
    fragment: fragmentSrc
  });

  $("#totoro").on("load", function(e) {
    return s.draw({
      uniforms: {
        img: $("#totoro")[0]
      }
    });
  });

  draw = function() {
    return s.draw({
      uniforms: {
        m1: flattenMatrix(matrix),
        m2: flattenMatrix(numeric.inv(matrix))
      }
    });
  };

  draw();

  eventPosition = function(e) {
    var $el, height, offset, width, x, y;
    $el = $("#c");
    offset = $el.offset();
    width = $el.width();
    height = $el.height();
    x = (e.pageX - offset.left) / width;
    y = 1 - (e.pageY - offset.top) / height;
    return [x, y, 1];
  };

  $("#c").on("mousedown", function(e) {
    var downLocal, downPosition, move, up;
    downPosition = eventPosition(e);
    downLocal = numeric.dot(matrix, downPosition);
    move = function(e) {
      var movePosition, transform;
      movePosition = eventPosition(e);
      transform = solve(function(m) {
        var moveLocal, newMatrix;
        newMatrix = numeric.dot(m, matrix);
        moveLocal = numeric.dot(newMatrix, movePosition);
        return dist(moveLocal, downLocal);
      }, function(_arg) {
        var x, y;
        x = _arg[0], y = _arg[1];
        return [[1, 0, x], [0, 1, y], [0, 0, 1]];
      }, [0, 0]);
      matrix = numeric.dot(transform, matrix);
      return draw();
    };
    up = function(e) {
      $(document).off("mousemove", move);
      return $(document).off("mouseup", up);
    };
    $(document).on("mousemove", move);
    return $(document).on("mouseup", up);
  });

}).call(this);
}, "shader": function(exports, require, module) {
/*
opts
  canvas: Canvas DOM element
  vertex: glsl source string
  fragment: glsl source string
  uniforms: a hash of names to values, the type is inferred as follows:
    Number or [Number]: float
    [Number, Number]: vec2
    [Number, Number, Number]: vec3
    [Number, Number, Number, Number]: vec4
    DOMElement: Sampler2D (e.g. Image/Video/Canvas)
    TODO: a way to force an arbitrary type


to set uniforms,
*/


(function() {
  var __hasProp = {}.hasOwnProperty;

  module.exports = function(opts) {
    var bufferAttribute, draw, getTexture, gl, o, program, replaceShader, set, setUniform, shaders, textures;
    o = {
      vertex: null,
      fragment: null,
      uniforms: {},
      canvas: opts.canvas
    };
    gl = null;
    program = null;
    shaders = {};
    textures = [];
    getTexture = function(element) {
      var i, t, texture, _i, _len;
      for (_i = 0, _len = textures.length; _i < _len; _i++) {
        t = textures[_i];
        if (t.element === element) {
          return t;
        }
      }
      i = textures.length;
      texture = gl.createTexture();
      textures[i] = {
        element: element,
        texture: texture,
        i: i
      };
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      return textures[i];
    };
    replaceShader = function(src, type) {
      var shader;
      if (shaders[type]) {
        gl.detachShader(program, shaders[type]);
      }
      shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      gl.deleteShader(shader);
      return shaders[type] = shader;
    };
    bufferAttribute = function(attrib, data, size) {
      var buffer, location;
      if (size == null) {
        size = 2;
      }
      location = gl.getAttribLocation(program, attrib);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(location);
      return gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    };
    setUniform = function(name, value) {
      var location, texture;
      location = gl.getUniformLocation(program, name);
      if (_.isNumber(value)) {
        return gl.uniform1fv(location, [value]);
      } else if (_.isArray(value)) {
        switch (value.length) {
          case 1:
            return gl.uniform1fv(location, value);
          case 2:
            return gl.uniform2fv(location, value);
          case 3:
            return gl.uniform3fv(location, value);
          case 4:
            return gl.uniform4fv(location, value);
          case 9:
            return gl.uniformMatrix3fv(location, false, value);
        }
      } else if (value.nodeName) {
        texture = getTexture(value);
        gl.activeTexture(gl.TEXTURE0 + texture.i);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, value);
        return gl.uniform1i(location, texture.i);
      } else if (!value) {
        return false;
      }
    };
    set = function(opts) {
      var name, value, _ref, _ref1, _results;
      if (opts.vertex) {
        o.vertex = opts.vertex;
        replaceShader(o.vertex, gl.VERTEX_SHADER);
      }
      if (opts.fragment) {
        o.fragment = opts.fragment;
        replaceShader(o.fragment, gl.FRAGMENT_SHADER);
      }
      if (opts.vertex || opts.fragment) {
        gl.linkProgram(program);
        gl.useProgram(program);
      }
      if (opts.uniforms) {
        _ref = opts.uniforms;
        for (name in _ref) {
          if (!__hasProp.call(_ref, name)) continue;
          value = _ref[name];
          o.uniforms[name] = value;
          setUniform(name, value);
        }
      }
      if (opts.vertex || opts.fragment) {
        _ref1 = o.uniforms;
        _results = [];
        for (name in _ref1) {
          if (!__hasProp.call(_ref1, name)) continue;
          value = _ref1[name];
          _results.push(setUniform(name, value));
        }
        return _results;
      }
    };
    draw = function(opts) {
      if (opts == null) {
        opts = {};
      }
      set(opts);
      return gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    gl = opts.canvas.getContext("experimental-webgl", {
      premultipliedAlpha: false
    });
    program = gl.createProgram();
    set(opts);
    gl.useProgram(program);
    bufferAttribute("vertexPosition", [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]);
    draw();
    return {
      get: function() {
        return o;
      },
      set: set,
      draw: draw,
      readPixels: function() {
        var arr, h, w;
        draw();
        w = gl.drawingBufferWidth;
        h = gl.drawingBufferHeight;
        arr = new Uint8Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, arr);
        return arr;
      },
      resize: function() {},
      ctx: function() {
        return gl;
      }
    };
  };

}).call(this);
}, "solve": function(exports, require, module) {(function() {
  var solve;

  solve = function(objective, argsToMatrix, startArgs) {
    var error, m, obj, original, solution, uncmin;
    original = argsToMatrix(startArgs);
    obj = function(args) {
      var matrix;
      matrix = argsToMatrix(args);
      return objective(matrix);
    };
    uncmin = numeric.uncmin(obj, startArgs);
    if (isNaN(uncmin.f)) {
      console.warn("NaN");
      return original;
    } else {
      error = obj(uncmin.solution);
      if (error > .000001) {
        console.warn("Error too big", error);
        return original;
      }
      solution = uncmin.solution;
      m = argsToMatrix(solution);
      return m;
    }
  };

  module.exports = solve;

}).call(this);
}});
