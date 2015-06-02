var hershey = require('hershey');
var THREE = require('flow').THREE;
var ThreeJSView = require('flow').views.ThreeJSView;

function XYGridAxesView(model, scene, options) {
  this.xyGridSize = (options.xyGridSize === undefined) ? 1.0 : options.xyGridSize;
  this.scaleXYZ = options.scaleXYZ;

  function floor(value, xyGridSize) {
    return Math.floor(value/xyGridSize)*xyGridSize;
  }
  function ceil(value, xyGridSize) {
    return Math.ceil(value/xyGridSize)*xyGridSize;
  }

  this.planeXMin = floor(model.xAxisMinMax.min, this.xyGridSize);
  this.planeYMin = floor(model.yAxisMinMax.min, this.xyGridSize);
  this.planeXMax = ceil(model.xAxisMinMax.max, this.xyGridSize);
  this.planeYMax = ceil(model.yAxisMinMax.max, this.xyGridSize);

  ThreeJSView.call(this, model, scene);
}

XYGridAxesView.prototype = Object.create(ThreeJSView.prototype);

XYGridAxesView.prototype.render = function() {
  ThreeJSView.prototype.render.call(this);

  var material = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 1,
  });

  // outline
  var outline = new THREE.Geometry();
  var valueMin = this.model.valueMinMax.min;
  outline.vertices.push(this.scaleXYZ(
    this.planeXMin, this.planeYMin, valueMin));
  outline.vertices.push(this.scaleXYZ(
    this.planeXMax, this.planeYMin, valueMin));
  outline.vertices.push(this.scaleXYZ(
    this.planeXMax, this.planeYMax, valueMin));
  outline.vertices.push(this.scaleXYZ(
    this.planeXMin, this.planeYMax, valueMin));
  outline.vertices.push(this.scaleXYZ(
    this.planeXMin, this.planeYMin, valueMin));
  this.sceneObject.add(new THREE.Line(outline, material));

  // ticks
  var tick;
  var hersheyResult;
  for (var x = this.planeXMin; x <= this.planeXMax; x += this.xyGridSize) {
    tick = new THREE.Geometry();
    tick.vertices.push(this.scaleXYZ(
      x, this.planeYMin, valueMin));
    tick.vertices.push(this.scaleXYZ(
      x, this.planeYMin - this.xyGridSize/4, valueMin));
    this.sceneObject.add(new THREE.Line(tick, material));

    hersheyResult = hershey.stringToLines(String(x.toFixed(1)));
    hersheyResult.lines.forEach(function(points) {

      var geom = new THREE.Geometry();
      geom.vertices = points.map(function(p) {
        return new THREE.Vector3(p[0]/400, -p[1]/400, 0);
      });

      var line = new THREE.Line(geom, material);

      var position = this.scaleXYZ(x, this.planeYMin - this.xyGridSize*3/8, valueMin);
      position.x -= hersheyResult.width/2/400;
      line.position.copy(position);

      this.sceneObject.add(line);
    }, this);
  }

  for (var y = this.planeYMin; y <= this.planeYMax; y += this.xyGridSize) {
    tick = new THREE.Geometry();
    tick.vertices.push(this.scaleXYZ(
      this.planeXMax, y, valueMin));
    tick.vertices.push(this.scaleXYZ(
      this.planeXMax + this.xyGridSize/4, y, valueMin));
    this.sceneObject.add(new THREE.Line(tick, material));

    hersheyResult = hershey.stringToLines(String(y.toFixed(1)));
    hersheyResult.lines.forEach(function(points) {

      var geom = new THREE.Geometry();
      geom.vertices = points.map(function(p) {
        return new THREE.Vector3(p[1]/400, p[0]/400, 0);
      });

      var line = new THREE.Line(geom, material);

      var position = this.scaleXYZ(this.planeXMax + this.xyGridSize*3/8, y, valueMin);
      position.y -= hersheyResult.width/2/400;
      line.position.copy(position);

      this.sceneObject.add(line);
    }, this);
  }
  
};

module.exports = XYGridAxesView;