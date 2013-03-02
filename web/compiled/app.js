
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
  var canvas, h, koState, koUpdate, state;

  _.reverse = function(a) {
    return a.slice().reverse();
  };

  canvas = $("#c")[0];

  canvas.width = $("#c").parent().width();

  canvas.height = $("#c").parent().height();

  require("draw");

  require("touch");

  state = require("state");

  h = $("#sidebar").hammer();

  h.on("tap", ".button-add", function(e) {
    var distortion;
    distortion = ko.dataFor(this);
    state.apply(function() {
      var c;
      c = {
        transform: numeric.inv(state.globalTransform),
        distortion: distortion
      };
      state.chain.push(c);
      return state.selected = c;
    });
    return false;
  });

  h.on("tap", ".button-remove", function(e) {
    var c;
    c = ko.dataFor(this);
    state.apply(function() {
      return state.chain = _.without(state.chain, c);
    });
    return false;
  });

  h.on("tap", ".distortion", function(e) {
    var c;
    c = ko.dataFor(this);
    state.apply(function() {
      return state.selected = c;
    });
    return false;
  });

  h.on("tap", function(e) {
    return state.apply(function() {
      return state.selected = false;
    });
  });

  koState = ko.observable();

  koUpdate = function() {
    return koState(state);
  };

  koUpdate();

  state.watch("chain", "selected", function() {
    return koUpdate();
  });

  ko.applyBindings({
    koState: koState
  });

}).call(this);
}, "bounds": function(exports, require, module) {(function() {

  module.exports = function() {
    var $el, height, width;
    $el = $("#c");
    width = $el.width();
    height = $el.height();
    if (width < height) {
      return {
        boundsMin: [-1, -1 * height / width],
        boundsMax: [1, 1 * height / width]
      };
    } else {
      return {
        boundsMin: [-1 * width / height, -1],
        boundsMax: [1 * width / height, 1]
      };
    }
  };

}).call(this);
}, "draw": function(exports, require, module) {(function() {
  var bounds, canvas, fragmentSrc, generate, image, s, setImage, shader, state, vertexSrc;

  shader = require("shader");

  state = require("state");

  generate = require("generate");

  bounds = require("bounds");

  vertexSrc = "precision highp float;\n\nattribute vec3 vertexPosition;\nvarying vec2 position;\nuniform vec2 boundsMin;\nuniform vec2 boundsMax;\n\nvoid main() {\n  gl_Position = vec4(vertexPosition, 1.0);\n  position = mix(boundsMin, boundsMax, (vertexPosition.xy + 1.0) * 0.5);\n}";

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

  s.set({
    uniforms: require("bounds")()
  });

  image = new Image();

  setImage = function(src) {
    image.src = src;
    return image.onload = function() {
      return s.draw({
        uniforms: {
          image: image,
          resolution: [canvas.width, canvas.height],
          imageResolution: [image.width, image.height]
        }
      });
    };
  };

  setImage("images/" + 0 + ".jpg");

  state.watch("globalTransform", function() {
    return _.pluck(state.chain, "transform");
  }, function() {
    return s.draw({
      uniforms: generate.uniforms()
    });
  });

  state.watch(function() {
    return _.pluck(state.chain, "distortion");
  }, function() {
    return s.draw({
      fragment: generate.code(),
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
    code += "\nprecision highp float;\n\nvarying vec2 position;\nuniform sampler2D image;\nuniform vec2 resolution;\nuniform vec2 imageResolution;\n\nuniform mat3 globalTransform;\n";
    _ref = _.reverse(state.chain);
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      c = _ref[i];
      code += "uniform mat3 m" + i + ";\n";
      code += "uniform mat3 m" + i + "inv;\n";
    }
    code += "\nvoid main() {\n  vec3 p = vec3(position, 1.);\n\n  //p.xy = vec2(length(p.xy), atan(p.y, p.x));\n";
    code += "\n";
    code += "p = globalTransform * p;";
    code += "\n";
    _ref1 = _.reverse(state.chain);
    for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
      c = _ref1[i];
      f = c.distortion.f;
      code += "\n";
      code += "p = m" + i + " * p;\n";
      code += "" + f + ";\n";
      code += "p = m" + i + "inv * p;\n";
      code += "\n";
    }
    code += "\n  //p.xy = vec2(p.x*cos(p.y), p.x*sin(p.y));\n\n  p.xy = (p.xy + 1.) * .5;\n\n  /*\n  if (p.x < 0. || p.x > 1. || p.y < 0. || p.y > 1.) {\n    // black if out of bounds\n    gl_FragColor = vec4(0., 0., 0., 1.);\n  } else {\n    gl_FragColor = texture2D(image, p.xy);\n  }\n  */\n\n  // mirror wrap it\n  p = abs(mod((p-1.), 2.)-1.);\n\n  gl_FragColor = texture2D(image, p.xy);\n}";
    return code;
  };

  flattenMatrix = function(m) {
    return _.flatten(numeric.transpose(m));
  };

  generate.uniforms = function() {
    var c, i, uniforms, _i, _len, _ref;
    uniforms = {
      globalTransform: flattenMatrix(state.globalTransform)
    };
    _ref = _.reverse(state.chain);
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      c = _ref[i];
      uniforms["m" + i] = flattenMatrix(c.transform);
      uniforms["m" + i + "inv"] = flattenMatrix(numeric.inv(c.transform));
    }
    return uniforms;
  };

  module.exports = generate;

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
  var ReactiveScope, distortions, state;

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
      title: "Wave",
      f: "p.x = sin(p.x)"
    }
  ];

  state = new ReactiveScope({
    distortions: distortions,
    chain: [],
    selected: false,
    globalTransform: numeric.identity(3)
  });

  state.watch("selected", "chain", function() {
    if (state.selected && !_.contains(state.chain, state.selected)) {
      return state.selected = false;
    }
  });

  window.state = state;

  module.exports = state;

}).call(this);
}, "touch": function(exports, require, module) {(function() {
  var bounds, debug, dist, eventPosition, getMatrix, h, lerp, setMatrix, solve, solveTouch, state, tracking, update;

  solve = require("solve");

  state = require("state");

  bounds = require("bounds");

  dist = function(p1, p2) {
    var d;
    d = numeric['-'](p1, p2);
    return numeric.dot(d, d);
  };

  lerp = function(x, min, max) {
    return min + x * (max - min);
  };

  eventPosition = function(e) {
    var $el, b, height, offset, width, x, y;
    $el = $("#c");
    offset = $el.offset();
    width = $el.width();
    height = $el.height();
    x = (e.pageX - offset.left) / width;
    y = 1 - (e.pageY - offset.top) / height;
    b = bounds();
    x = lerp(x, b.boundsMin[0], b.boundsMax[0]);
    y = lerp(y, b.boundsMin[1], b.boundsMax[1]);
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

  getMatrix = function() {
    if (state.selected) {
      return numeric.dot(state.selected.transform, state.globalTransform);
    } else {
      return state.globalTransform;
    }
  };

  setMatrix = function(m) {
    if (state.selected) {
      return state.selected.transform = numeric.dot(m, numeric.inv(state.globalTransform));
    } else {
      return state.globalTransform = m;
    }
  };

  tracking = {};

  debug = function() {
    return $("#debug").html(JSON.stringify(tracking));
  };

  update = function(touches) {
    var ids, matrix, newMatrix, t, touch, _i, _len;
    matrix = getMatrix();
    ids = [];
    for (_i = 0, _len = touches.length; _i < _len; _i++) {
      touch = touches[_i];
      ids.push(touch.identifier);
      if (t = tracking[touch.identifier]) {
        t.current = eventPosition(touch);
      } else {
        t = tracking[touch.identifier] = {};
        t.current = eventPosition(touch);
        t.original = numeric.dot(matrix, t.current);
      }
    }
    tracking = _.pick(tracking, ids);
    newMatrix = solveTouch(_.values(tracking), matrix);
    state.apply(function() {
      return setMatrix(newMatrix);
    });
    return debug();
  };

  h = $("#c").hammer({
    drag_max_touches: 0
  });

  h.on("drag touch", function(e) {
    var touches;
    touches = e.gesture.touches;
    update(touches);
    return e.gesture.preventDefault();
  });

  h.on("release", function(e) {
    var touch, touches, _i, _len, _results;
    touches = e.gesture.touches;
    _results = [];
    for (_i = 0, _len = touches.length; _i < _len; _i++) {
      touch = touches[_i];
      _results.push(delete tracking[touch.identifier]);
    }
    return _results;
  });

  $("#debug").html(JSON.stringify(bounds()));

}).call(this);
}});
