(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['gmruler'] = factory();
  }
}(this, function () {

var $GM, $GME, LabelOverlay, gmruler,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$GM = google.maps;

$GME = $GM.event;

gmruler = {
  bind: function(map, options) {
    this.map = map;
    this.options = options != null ? options : {};
    this.points = [];
    this.createLine();
    return this.listener = $GME.addListener(this.map, 'rightclick', (function(_this) {
      return function(event) {
        return _this.addPoint(event.latLng);
      };
    })(this));
  },
  unbind: function() {
    this.clear();
    this.line = null;
    return $GME.removeListener(this.listener);
  },
  createLine: function() {
    this.line = new $GM.Polyline({
      path: [],
      strokeColor: this.options.strokeColor || '#ff0000',
      strokeWeight: this.options.strokeWeight || 2
    });
    return this.line.setMap(this.map);
  },
  addPoint: function(latLng) {
    var num, point;
    num = this.points.length;
    this.line.getPath().push(latLng);
    point = new LabelOverlay(this.map, latLng, num, this, this.options);
    this.points.push(point);
    return this.updateDistance(num);
  },
  removePoint: function(index) {
    return this.pointRemoved(index);
  },
  calculateDistance: function(point1, point2) {
    return $GM.geometry.spherical.computeDistanceBetween(point1, point2);
  },
  pointPositionUpdated: function(index, position) {
    this.line.getPath().setAt(index, position);
    return this.updateDistance(index);
  },
  pointRemoved: function(index) {
    if (index === 0) {
      return;
    }
    this.line.getPath().removeAt(index);
    this.points.splice(index, 1);
    this.updateIndex(index);
    return this.updateDistance(index);
  },
  updateDistance: function(startIndex) {
    var index, _i, _ref, _results;
    if (startIndex < 1) {
      startIndex = 1;
    }
    _results = [];
    for (index = _i = startIndex, _ref = this.points.length; startIndex <= _ref ? _i < _ref : _i > _ref; index = startIndex <= _ref ? ++_i : --_i) {
      this.points[index].distance = this.points[index - 1].distance + this.calculateDistance(this.positionAt(index - 1), this.positionAt(index));
      _results.push(this.points[index].updateDistance());
    }
    return _results;
  },
  updateIndex: function(startIndex) {
    var index, _i, _ref, _results;
    if (startIndex < 1) {
      startIndex = 1;
    }
    _results = [];
    for (index = _i = startIndex, _ref = this.points.length; startIndex <= _ref ? _i < _ref : _i > _ref; index = startIndex <= _ref ? ++_i : --_i) {
      _results.push(this.points[index].index = this.points[index].index - 1);
    }
    return _results;
  },
  positionAt: function(index) {
    return this.line.getPath().getAt(index);
  },
  clear: function() {
    var point, _i, _len, _ref;
    this.line.setPath([]);
    _ref = this.points;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      point = _ref[_i];
      point.setMap(null);
    }
    return this.points = [];
  }
};

LabelOverlay = (function(_super) {
  __extends(LabelOverlay, _super);

  function LabelOverlay(map, position, index, observer, options) {
    this.map = map;
    this.position = position;
    this.index = index;
    this.observer = observer;
    this.options = options != null ? options : {};
    this.container = document.createElement('div');
    this.container.className = 'gmruler-label';
    this.distance = this.index === 0 ? 0 : -1;
    this.setMap(this.map);
  }

  LabelOverlay.prototype.onAdd = function() {
    var panes;
    this.updateDistance();
    this.container.draggable = true;
    this.eventListeners = [
      $GME.addDomListener(this.container, 'mousedown', (function(_this) {
        return function(e) {
          _this.map.set('draggable', false);
          _this.set('origin', e);
          return _this.moveHandler = $GME.addDomListener(_this.map.getDiv(), 'mousemove', function(e) {
            var latLng, left, origin, pos, top;
            origin = _this.get('origin');
            left = origin.clientX - e.clientX;
            top = origin.clientY - e.clientY;
            pos = _this.getProjection().fromLatLngToDivPixel(_this.position);
            latLng = _this.getProjection().fromDivPixelToLatLng(new $GM.Point(pos.x - left, pos.y - top));
            _this.set('origin', e);
            _this.set('position', latLng);
            _this.draw();
            if (_this.observer && _this.observer.pointPositionUpdated) {
              return _this.observer.pointPositionUpdated(_this.index, latLng);
            }
          });
        };
      })(this)), $GME.addDomListener(this.container, 'mouseup', (function(_this) {
        return function(e) {
          _this.map.set('draggable', true);
          return $GME.removeListener(_this.moveHandler);
        };
      })(this)), $GME.addDomListener(this.container, 'dblclick', (function(_this) {
        return function(e) {
          if (_this.index === 0) {
            return;
          }
          _this.onRemove();
          if (_this.observer && _this.observer.pointRemoved) {
            _this.observer.pointRemoved(_this.index);
          }
          return _this.stopEvent(e);
        };
      })(this))
    ];
    panes = this.getPanes();
    return panes.floatPane.appendChild(this.container);
  };

  LabelOverlay.prototype.draw = function() {
    var loc;
    loc = this.getProjection().fromLatLngToDivPixel(this.position);
    this.container.style.left = loc.x + 'px';
    return this.container.style.top = loc.y + 'px';
  };

  LabelOverlay.prototype.updateDistance = function() {
    var markup;
    markup = (function() {
      switch (this.options.distanceUnit) {
        case 'mile':
          return (this.distance * 0.000621371).toFixed(2) + ' mile(s)';
        default:
          return (this.distance / 1000).toFixed(2) + ' km';
      }
    }).call(this);
    return this.container.innerHTML = this.distance > 0 ? markup : this.distance === 0 ? 'Start' : '';
  };

  LabelOverlay.prototype.onRemove = function() {
    var eventListener, _i, _len, _ref, _results;
    this.container.parentNode.removeChild(this.container);
    _ref = this.eventListeners;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      eventListener = _ref[_i];
      _results.push($GME.removeListener(eventListener));
    }
    return _results;
  };

  LabelOverlay.prototype.stopEvent = function(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.cancelBubble = true;
    if (e.stopPropagation) {
      return e.stopPropagation();
    }
  };

  return LabelOverlay;

})($GM.OverlayView);

return gmruler;

}));
