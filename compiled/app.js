
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
}).call(this)({"ReactiveScope": function(exports, require, module) {(function() {
  var ReactiveScope, Watcher, deepClone, isPlainObject,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  isPlainObject = function(o) {
    return o.constructor === Object;
  };

  deepClone = function(o) {
    var k, result, v;
    if (_.isArray(o)) {
      return _.map(o, deepClone);
    } else if (isPlainObject(o)) {
      result = {};
      for (k in o) {
        if (!__hasProp.call(o, k)) continue;
        v = o[k];
        result[k] = deepClone(v);
      }
      return result;
    } else {
      return o;
    }
  };

  Watcher = (function() {

    function Watcher(watchFn, callback) {
      this.watchFn = watchFn;
      this.callback = callback;
      this._oldValue = void 0;
      this.update();
    }

    Watcher.prototype.update = function() {
      var newValue, updated;
      newValue = this.watchFn();
      updated = !_.isEqual(this._oldValue, newValue);
      this._oldValue = newValue;
      return updated;
    };

    return Watcher;

  })();

  ReactiveScope = (function() {

    function ReactiveScope(initial) {
      var k, v;
      this._watchers = [];
      for (k in initial) {
        if (!__hasProp.call(initial, k)) continue;
        v = initial[k];
        this[k] = v;
      }
    }

    ReactiveScope.prototype.watch = function() {
      var args, callback, remover, watchExprs, watchFn, watcher;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      callback = _.last(args);
      watchExprs = _.initial(args);
      watchFn = _.bind(function() {
        var result, watchExpr;
        result = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = watchExprs.length; _i < _len; _i++) {
            watchExpr = watchExprs[_i];
            if (_.isString(watchExpr)) {
              _results.push(this[watchExpr]);
            } else if (_.isFunction(watchExpr)) {
              _results.push(watchExpr());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }).call(this);
        return deepClone(result);
      }, this);
      watcher = new Watcher(watchFn, callback);
      this._watchers.push(watcher);
      remover = _.bind(function() {
        return this._watchers = _.without(this._watchers, watcher);
      }, this);
      return remover;
    };

    ReactiveScope.prototype.apply = function(fn) {
      var result;
      result = fn();
      this.digest();
      return result;
    };

    ReactiveScope.prototype.digest = function() {
      var callback, callbacks, digestCycles, dirty, updated, watcher, _i, _len, _ref, _results;
      dirty = true;
      digestCycles = 0;
      _results = [];
      while (dirty) {
        digestCycles++;
        if (digestCycles > 10) {
          throw "Maximum digest cycles (10) exceeded.";
        }
        dirty = false;
        callbacks = [];
        _ref = this._watchers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          watcher = _ref[_i];
          updated = watcher.update();
          if (updated) {
            callbacks.push(watcher.callback);
            dirty = true;
          }
        }
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = callbacks.length; _j < _len1; _j++) {
            callback = callbacks[_j];
            _results1.push(callback());
          }
          return _results1;
        })());
      }
      return _results;
    };

    return ReactiveScope;

  })();

  module.exports = ReactiveScope;

}).call(this);
}, "app": function(exports, require, module) {(function() {

  require("draw");

  require("manipulate");

}).call(this);
}, "draw": function(exports, require, module) {(function() {
  var canvas, fragmentSrc, generate, s, shader, state, vertexSrc;

  shader = require("shader");

  state = require("state");

  generate = require("generate");

  vertexSrc = "precision mediump float;\n\nattribute vec3 vertexPosition;\nvarying vec2 position;\n\nvoid main() {\n  gl_Position = vec4(vertexPosition, 1.0);\n  position = (vertexPosition.xy + 1.0) * 0.5;\n}";

  fragmentSrc = generate.code();

  canvas = $("#c")[0];

  canvas.width = $("#c").parent().width();

  canvas.height = $("#c").parent().height();

  s = shader({
    canvas: canvas,
    vertex: vertexSrc,
    fragment: generate.code(),
    uniforms: generate.uniforms()
  });

  $("#totoro").on("load", function(e) {
    return s.draw({
      uniforms: {
        image: $("#totoro")[0],
        resolution: [canvas.width, canvas.height],
        imageResolution: [$("#totoro").width(), $("#totoro").height()]
      }
    });
  });

  state.watch(function() {
    return _.pluck(state.chain, "transform");
  }, function() {
    return s.draw({
      uniforms: generate.uniforms()
    });
  });

}).call(this);
}, "generate": function(exports, require, module) {(function() {
  var flattenMatrix, generate, state;

  state = require("state");

  generate = {};

  generate.code = function() {
    var c, code, f, i, _i, _j, _len, _len1, _ref, _ref1;
    code = "";
    code += "\nprecision mediump float;\n\nvarying vec2 position;\nuniform sampler2D image;\nuniform vec2 resolution;\nuniform vec2 imageResolution;\n";
    _ref = state.chain;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      c = _ref[i];
      code += "uniform mat3 m" + i + ";\n";
      code += "uniform mat3 m" + i + "inv;\n";
    }
    code += "\nvoid main() {\n  vec3 p = vec3(position, 1.);\n";
    _ref1 = state.chain;
    for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
      c = _ref1[i];
      f = c.distortion.f;
      code += "\n";
      code += "p = m" + i + " * p;\n";
      code += "" + f + ";\n";
      code += "p = m" + i + "inv * p;\n";
      code += "\n";
    }
    code += "  if (p.x < 0. || p.x > 1. || p.y < 0. || p.y > 1.) {\n    // black if out of bounds\n    gl_FragColor = vec4(0., 0., 0., 1.);\n  } else {\n    gl_FragColor = texture2D(image, p.xy);\n  }\n}";
    return code;
  };

  flattenMatrix = function(m) {
    return _.flatten(numeric.transpose(m));
  };

  generate.uniforms = function() {
    var c, i, uniforms, _i, _len, _ref;
    uniforms = {};
    _ref = state.chain;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      c = _ref[i];
      uniforms["m" + i] = flattenMatrix(c.transform);
      uniforms["m" + i + "inv"] = flattenMatrix(numeric.inv(c.transform));
    }
    return uniforms;
  };

  module.exports = generate;

}).call(this);
}, "manipulate": function(exports, require, module) {(function() {
  var dist, draw, eventPosition, lastLocal, lastPosition, placeTouchHint, solve, solveTouch, state;

  solve = require("solve");

  state = require("state");

  draw = require("draw");

  dist = function(p1, p2) {
    var d;
    d = numeric['-'](p1, p2);
    return numeric.dot(d, d);
  };

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

  solveTouch = function(touches, matrix) {
    var objective, transform;
    objective = function(m) {
      var currentLocal, error, newMatrix, touch, _i, _len;
      newMatrix = numeric.dot(m, matrix);
      error = 0;
      for (_i = 0, _len = touches.length; _i < _len; _i++) {
        touch = touches[_i];
        currentLocal = numeric.dot(newMatrix, touch.current);
        error += dist(touch.original, currentLocal);
      }
      return error;
    };
    if (touches.length === 1) {
      transform = solve(objective, function(_arg) {
        var x, y;
        x = _arg[0], y = _arg[1];
        return [[1, 0, x], [0, 1, y], [0, 0, 1]];
      }, [0, 0]);
    } else if (touches.length === 2) {
      transform = solve(objective, function(_arg) {
        var r, s, x, y;
        s = _arg[0], r = _arg[1], x = _arg[2], y = _arg[3];
        return [[s, r, x], [-r, s, y], [0, 0, 1]];
      }, [1, 0, 0, 0]);
    }
    return numeric.dot(transform, matrix);
  };

  lastPosition = false;

  lastLocal = false;

  $("#c").on("mousedown", function(e) {
    var downLocal, downPosition, matrix, move, up;
    matrix = state.chain[0].transform;
    downPosition = eventPosition(e);
    downLocal = numeric.dot(matrix, downPosition);
    if (!key.shift) {
      $(".touch-hint").css({
        display: "none"
      });
    }
    move = function(e) {
      var movePosition, newMatrix;
      movePosition = eventPosition(e);
      if (key.shift) {
        newMatrix = solveTouch([
          {
            original: downLocal,
            current: movePosition
          }, {
            original: lastLocal,
            current: lastPosition
          }
        ], matrix);
      } else {
        newMatrix = solveTouch([
          {
            original: downLocal,
            current: movePosition
          }
        ], matrix);
      }
      return state.apply(function() {
        matrix = newMatrix;
        return state.chain[0].transform = newMatrix;
      });
    };
    up = function(e) {
      lastPosition = eventPosition(e);
      lastLocal = numeric.dot(matrix, lastPosition);
      placeTouchHint();
      $(document).off("mousemove", move);
      return $(document).off("mouseup", up);
    };
    $(document).on("mousemove", move);
    $(document).on("mouseup", up);
    e.preventDefault();
    return true;
  });

  placeTouchHint = function() {
    var $el, height, offset, width, x, y;
    $el = $("#c");
    offset = $el.offset();
    width = $el.width();
    height = $el.height();
    x = lastPosition[0] * width + offset.left;
    y = (1 - lastPosition[1]) * height + offset.top;
    return $(".touch-hint").css({
      display: "block",
      left: x,
      top: y
    });
  };

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
}, "state": function(exports, require, module) {(function() {
  var ReactiveScope, distortions, model;

  ReactiveScope = require("ReactiveScope");

  distortions = [
    {
      title: "Reflect",
      f: "p.x = abs(p.x)"
    }, {
      title: "Repeat",
      f: "p.x = fract(p.x)"
    }, {
      title: "Clamp",
      f: "p.x = min(p.x, 0.)"
    }, {
      title: "Step",
      f: "p.x = floor(p.x)"
    }, {
      title: "Sine",
      f: "p.x = sin(p.x)"
    }
  ];

  model = new ReactiveScope({
    distortions: distortions,
    chain: [],
    transform: numeric.identity(3),
    matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  });

  model.chain.push({
    transform: numeric.identity(3),
    distortion: distortions[0]
  });

  module.exports = model;

}).call(this);
}});
