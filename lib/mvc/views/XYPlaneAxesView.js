var THREE = require('flow').THREE;
var ThreeJSView = require('flow').views.ThreeJSView;

function XYGridAxesView(model, scene, options) {
  this.gridSize = 1.0;
  this.scaleXYZ = options.scaleXYZ;

  function floor(value, gridSize) {
    return Math.floor(value/gridSize)*gridSize;
  }
  function ceil(value, gridSize) {
    return Math.ceil(value/gridSize)*gridSize;
  }

  this.planeXMin = floor(model.xAxisMinMax.min, this.gridSize);
  this.planeYMin = floor(model.yAxisMinMax.min, this.gridSize);
  this.planeXMax = ceil(model.xAxisMinMax.max, this.gridSize);
  this.planeYMax = ceil(model.yAxisMinMax.max, this.gridSize);

  ThreeJSView.call(this, model, scene);
}

XYGridAxesView.prototype = Object.create(ThreeJSView.prototype);

XYGridAxesView.prototype.render = function() {

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
  this.sceneObject.add(new THREE.Line(
    outline,
    new THREE.LineBasicMaterial({ color: 0x000000 })));

  // ticks
  var tick;
  for (var x = this.planeXMin; x <= this.planeXMax; x += this.gridSize) {
    tick = new THREE.Geometry();
    tick.vertices.push(this.scaleXYZ(
      x, this.planeYMax, valueMin));
    tick.vertices.push(this.scaleXYZ(
      x, this.planeYMax + this.gridSize/2, valueMin));
    this.sceneObject.add(new THREE.Line(
      tick,
      new THREE.LineBasicMaterial({ color: 0x000000 })));
  }
  for (var y = this.planeYMin; y <= this.planeYMax; y += this.gridSize) {
    tick = new THREE.Geometry();
    tick.vertices.push(this.scaleXYZ(
      this.planeXMax, y, valueMin));
    tick.vertices.push(this.scaleXYZ(
      this.planeXMax + this.gridSize/2, y, valueMin));
    this.sceneObject.add(new THREE.Line(
      tick,
      new THREE.LineBasicMaterial({ color: 0x000000 })));
  }

  // center
  this.sceneObject.position.copy(this.scaleXYZ(
    -(this.model.xRange/2 - this.model.xAxisMinMax.min),  
    -(this.model.yRange/2 - this.model.yAxisMinMax.min), 
    this.model.valueMinMax.min));

  
};

module.exports = XYGridAxesView;