// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"lib/utils.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function getCanvasAndContext(width, height) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to create canvas');
  }

  return {
    canvas: canvas,
    context: context
  };
}

exports.getCanvasAndContext = getCanvasAndContext;

function getCharSize(char, fontSize, fontFamily, fontWeight) {
  if (fontFamily === void 0) {
    fontFamily = 'sans-serif';
  }

  if (fontWeight === void 0) {
    fontWeight = 'normal';
  }

  var ctx = getCanvasAndContext(fontSize, fontSize).context;
  var font = fontWeight + " " + fontSize + "px " + fontFamily;
  ctx.font = font;
  ctx.textBaseline = 'top';
  ctx.fillText(char, 0, 0);
  var count = 0;
  var left = -1,
      right = fontSize,
      top = -1,
      bottom = fontSize;
  var imageData = ctx.getImageData(0, 0, fontSize, fontSize).data; // 遍历像素找包围盒

  for (var i = 0; i < fontSize && count < 4; ++i) {
    for (var j = 0; j < fontSize && count < 4; ++j) {
      var topIndex = (i * fontSize + j) * 4;
      var leftIndex = (i + j * fontSize) * 4;

      if (top < 0 && imageData[topIndex + 3]) {
        top = i;
        ++count;
      }

      if (left < 0 && imageData[leftIndex + 3]) {
        left = i;
        ++count;
      }

      if (bottom == fontSize && imageData[imageData.length - topIndex - 1]) {
        bottom = fontSize - i;
        ++count;
      }

      if (imageData[imageData.length - leftIndex - 1]) {
        right = fontSize - i;
        ++count;
      }
    }
  }

  var width = right - left,
      height = bottom - top;
  return {
    top: top,
    left: left,
    width: width,
    height: height
  };
}

exports.getCharSize = getCharSize;

function randomOp() {
  return Math.floor(Math.random() * 10) % 2 ? 1 : -1;
}

exports.randomOp = randomOp;

function canvasRotate(context, angle, x, y) {
  context.translate(x, y);
  context.rotate(Math.PI * angle / 180);
  context.translate(-x, -y);
}

exports.canvasRotate = canvasRotate;
},{}],"lib/box/BoxChar.ts":[function(require,module,exports) {
"use strict";

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = __importStar(require("../utils"));

var MAX_ANGLE = 10;
var COLORS;

(function (COLORS) {
  COLORS["RED"] = "#E5191C";
  COLORS["WHITE"] = "#FDFDFD";
  COLORS["BLACK"] = "#0F0F0F";
})(COLORS = exports.COLORS || (exports.COLORS = {}));

;
var CHAR_MODE;

(function (CHAR_MODE) {
  CHAR_MODE[CHAR_MODE["FIRST"] = 1] = "FIRST";
  CHAR_MODE[CHAR_MODE["WHITE"] = 2] = "WHITE";
  CHAR_MODE[CHAR_MODE["RED"] = 3] = "RED";
  CHAR_MODE[CHAR_MODE["SPACE"] = 4] = "SPACE";
})(CHAR_MODE = exports.CHAR_MODE || (exports.CHAR_MODE = {}));

;

var BoxChar =
/** @class */
function () {
  function BoxChar(char, mode, fontSize, fontFamily) {
    if (fontSize === void 0) {
      fontSize = 60;
    }

    if (fontFamily === void 0) {
      fontFamily = 'sans-serif';
    }

    this.char = '';
    this.fontFamily = '';
    this.fontSize = 0;
    this.width = 0;
    this.height = 0;
    this.left = 0;
    this.top = 0;
    this.angle = 0;
    this.scale = 0;
    this.mode = CHAR_MODE.WHITE;
    this.color = COLORS.WHITE;
    this.char = char;
    this.mode = mode;
    this.fontFamily = fontFamily;

    if (mode == CHAR_MODE.SPACE) {
      return;
    }

    var angle = -(Math.round(Math.random() * 10) % MAX_ANGLE);

    if (mode == CHAR_MODE.FIRST) {
      this.scale = 1.1;
      this.angle = angle;
    } else {
      this.scale = 1 - Math.floor(Math.random() * 10) % 3 / 10;
      this.angle = angle * _.randomOp();
    }

    this.fontSize = fontSize * this.scale;

    if (mode == CHAR_MODE.RED) {
      this.color = COLORS.RED;
    }

    var _a = _.getCharSize(char, this.fontSize, this.fontFamily, 'bold'),
        width = _a.width,
        height = _a.height,
        top = _a.top,
        left = _a.left;

    this.width = width;
    this.height = height;
    this.top = top;
    this.left = left;
  }

  Object.defineProperty(BoxChar.prototype, "font", {
    get: function get() {
      return "bold " + this.fontSize + "px " + this.fontFamily;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BoxChar.prototype, "rotateSize", {
    get: function get() {
      var angle = this.angle * Math.PI / 180;
      var sin = Math.abs(Math.sin(angle)),
          cos = Math.abs(Math.cos(angle));
      var width = Math.ceil(this.width * cos) + Math.ceil(this.height * sin);
      var height = Math.ceil(this.height * cos) + Math.ceil(this.width * sin);
      return {
        width: width,
        height: height
      };
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(BoxChar.prototype, "outterSize", {
    get: function get() {
      var _a = this.rotateSize,
          width = _a.width,
          height = _a.height;
      var scale = this.mode == CHAR_MODE.FIRST ? BoxChar.BorderScale : BoxChar.BackgroundScale;
      return {
        width: width * scale,
        height: height * scale
      };
    },
    enumerable: true,
    configurable: true
  });
  BoxChar.BorderScale = 1.4;
  BoxChar.BackgroundScale = 1.2;
  return BoxChar;
}();

exports.default = BoxChar;
},{"../utils":"lib/utils.ts"}],"lib/box/BoxText.ts":[function(require,module,exports) {
"use strict";

var __values = this && this.__values || function (o) {
  var m = typeof Symbol === "function" && o[Symbol.iterator],
      i = 0;
  if (m) return m.call(o);
  return {
    next: function next() {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
};

var __read = this && this.__read || function (o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
};

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = __importStar(require("../utils"));

var BoxChar_1 = __importStar(require("./BoxChar"));

var BoxText =
/** @class */
function () {
  function BoxText(text, options) {
    var e_1, _a;

    this.chars = [];
    this.fontSize = 60;
    this.fontFamily = 'sans-serif';
    this.gutter = 5;
    this.pendding = 30;

    if (options) {
      var fontSize = options.fontSize,
          fontFamily = options.fontFamily,
          gutter = options.gutter,
          pendding = options.pendding;
      fontSize && (this.fontSize = fontSize);
      fontFamily && (this.fontFamily = fontFamily);
      gutter && (this.gutter = gutter);
      pendding && (this.pendding = pendding);
    }

    if (!text) {
      throw new Error('Must set text.');
    }

    var chars = text.toUpperCase().split('');
    var modes = new Array(chars.length).fill(BoxChar_1.CHAR_MODE.WHITE);
    modes[0] = BoxChar_1.CHAR_MODE.FIRST; // 随机选择标红的字，一定范围内只允许出现一次

    var range = 5;

    for (var i = 1; i < chars.length; i += range) {
      for (var j = i; j < i + range - 1 && j < chars.length; ++j) {
        if (Math.random() * 10 > 6) {
          modes[j] = BoxChar_1.CHAR_MODE.RED;
          break;
        }
      }
    }

    try {
      for (var _b = __values(chars.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
        var _d = __read(_c.value, 2),
            index = _d[0],
            char = _d[1];

        if (/^\s$/.test(char)) {
          this.chars.push(new BoxChar_1.default('', BoxChar_1.CHAR_MODE.SPACE));
        } else {
          this.chars.push(new BoxChar_1.default(char, modes[index], this.fontSize, this.fontFamily));
        }
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  }

  BoxText.prototype.draw = function (canvas) {
    var e_2, _a, e_3, _b;

    var ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create canvas');
    }

    var pendding = this.pendding,
        gutter = this.gutter;
    var canvasWidth = pendding * 2,
        canvasHeight = 0;

    try {
      for (var _c = __values(this.chars), _d = _c.next(); !_d.done; _d = _c.next()) {
        var boxChar = _d.value;

        if (boxChar instanceof BoxChar_1.default) {
          var size = boxChar.outterSize;
          canvasWidth += size.width + gutter;
          canvasHeight = Math.max(canvasHeight, size.height);
        } else {
          canvasWidth += 2 * gutter;
        }
      }
    } catch (e_2_1) {
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
      } finally {
        if (e_2) throw e_2.error;
      }
    }

    var drawOffset = pendding;
    canvasHeight = canvasHeight + pendding * 2;
    canvas.height = canvasHeight;
    canvas.width = canvasWidth;
    ctx.fillStyle = BoxChar_1.COLORS.BLACK;
    ctx.textBaseline = 'top';

    try {
      for (var _e = __values(this.chars), _f = _e.next(); !_f.done; _f = _e.next()) {
        var boxChar = _f.value;

        if (boxChar.mode == BoxChar_1.CHAR_MODE.SPACE) {
          drawOffset += 2 * gutter;
          continue;
        }

        ctx.save();
        var char = boxChar.char,
            top = boxChar.top,
            left = boxChar.left,
            width_1 = boxChar.width,
            height = boxChar.height,
            angle = boxChar.angle,
            mode = boxChar.mode,
            color = boxChar.color;

        if (mode == BoxChar_1.CHAR_MODE.FIRST) {
          var _g = boxChar.outterSize,
              borderWidth = _g.width,
              borderHeight = _g.height;
          var rotateX = drawOffset + borderWidth / 2,
              rotateY = pendding + borderHeight / 2;

          _.canvasRotate(ctx, angle - 5, rotateX, rotateY);

          ctx.fillStyle = BoxChar_1.COLORS.BLACK;
          ctx.fillRect(drawOffset, (canvasHeight - borderHeight) / 2, borderWidth, borderHeight);

          _.canvasRotate(ctx, 3, rotateX, rotateY);

          var bgScale = 0.85;
          var bgWidth = borderWidth * bgScale,
              bgHeight = borderHeight * bgScale;
          var bgLeft = drawOffset + (borderWidth - bgWidth) / 2,
              bgTop = (canvasHeight - bgHeight) / 2;
          ctx.fillStyle = BoxChar_1.COLORS.RED;
          ctx.fillRect(bgLeft, bgTop, bgWidth, bgHeight);

          _.canvasRotate(ctx, 2, rotateX, rotateY);

          var textLeft = drawOffset + (borderWidth - width_1) / 2 - left,
              textTop = (canvasHeight - height) / 2 - top;
          ctx.fillStyle = color;
          ctx.font = boxChar.font;
          ctx.fillText(char, textLeft, textTop);
          drawOffset += boxChar.outterSize.width + gutter;
        } else {
          var _h = boxChar.outterSize,
              bgWidth = _h.width,
              bgHeight = _h.height;
          var rotateX = drawOffset + bgWidth / 2,
              rotateY = pendding + bgHeight / 2;

          _.canvasRotate(ctx, angle + 1, rotateX, rotateY);

          ctx.fillStyle = BoxChar_1.COLORS.BLACK;
          ctx.fillRect(drawOffset, (canvasHeight - bgHeight) / 2, bgWidth, bgHeight);
          var textLeft = drawOffset + (bgWidth - width_1) / 2 - left,
              textTop = (canvasHeight - height) / 2 - top;

          _.canvasRotate(ctx, -1, rotateX, rotateY);

          ctx.fillStyle = color;
          ctx.font = boxChar.font;
          ctx.fillText(char, textLeft, textTop);
          drawOffset += boxChar.outterSize.width + gutter;
        }

        ctx.restore();
      }
    } catch (e_3_1) {
      e_3 = {
        error: e_3_1
      };
    } finally {
      try {
        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
      } finally {
        if (e_3) throw e_3.error;
      }
    }

    var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    var newImageData = ctx.createImageData(canvasWidth, canvasHeight);
    var coreSize = 6,
        start = Math.floor(coreSize / 2);

    for (var i = start; i < imageData.height - start; ++i) {
      for (var j = start; j < imageData.width - start; ++j) {
        var index = i * imageData.width * 4 + j * 4;

        if (!imageData.data[index + 3]) {
          continue;
        }

        var a = imageData.data[index + 3];

        for (var x = i - coreSize + 1; x < i + coreSize; ++x) {
          for (var y = j - coreSize + 1; y < j + coreSize; ++y) {
            var newIndex = x * imageData.width * 4 + y * 4;
            newImageData.data[newIndex] = 255;
            newImageData.data[newIndex + 1] = 255;
            newImageData.data[newIndex + 2] = 255;
            newImageData.data[newIndex + 3] += a / 4;
          }
        }
      }
    }

    var _j = _.getCanvasAndContext(canvasWidth, canvasHeight),
        borderCanvas = _j.canvas,
        borderCtx = _j.context;

    borderCtx.putImageData(newImageData, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(borderCanvas, 0, 0);
    var step = canvasWidth / 10;
    var width = step;
    var isRed = true;

    while (width < canvasWidth) {
      ctx.beginPath();
      ctx.arc(canvasWidth / 2, canvasHeight / 2, width, 0, 360);
      ctx.closePath();
      ctx.fillStyle = isRed ? BoxChar_1.COLORS.RED : BoxChar_1.COLORS.BLACK;
      isRed = !isRed;
      ctx.fill();
      width += step;
    }

    ctx.restore();
  };

  return BoxText;
}();

exports.default = BoxText;
},{"../utils":"lib/utils.ts","./BoxChar":"lib/box/BoxChar.ts"}],"web.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var BoxText_1 = __importDefault(require("./lib/box/BoxText"));

exports.default = function () {
  var contentInput = document.getElementById('contentInput');
  var fontSizeInput = document.getElementById('fontSizeInput');
  var fontFamilyInput = document.getElementById('fontFamilyInput');
  var goButton = document.getElementById('goButton');
  var saveButton = document.getElementById('saveButton');
  var canvas = document.getElementById('canvas');
  goButton.addEventListener('click', function () {
    var value = (contentInput.value || '').trim();

    if (!value) {
      return;
    }

    var fontSize = Math.min(Math.abs(+fontSizeInput.value || 60));
    var fontFamily = fontFamilyInput.value || 'sans-serif';
    var box = new BoxText_1.default(value, {
      fontSize: fontSize,
      fontFamily: fontFamily
    });
    box.draw(canvas);
  });
  goButton.click();
  saveButton.addEventListener('click', function () {
    var imageURL = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    var a = document.createElement('a');
    a.href = imageURL;
    a.download = contentInput.value + ".png";
    a.target = 'blank';
    a.click();
  });
};
},{"./lib/box/BoxText":"lib/box/BoxText.ts"}],"index.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var web_1 = __importDefault(require("./web"));

window.onload = web_1.default;
},{"./web":"web.ts"}],"../node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "64443" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../node_modules/parcel/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/src.77de5100.map