var hershey = require('hershey');
var THREE = require('flow').THREE;
var ThreeJSView = require('flow').views.ThreeJSView;

function ZAxisView(model, scene, options) {
  this.xyGridSize = 1.0;
  this.zGridSize = 200.0;
  this.scaleXYZ = options.scaleXYZ;

  function floor(value, gridSize) {
    return Math.floor(value/gridSize)*gridSize;
  }
  function ceil(value, gridSize) {
    return Math.ceil(value/gridSize)*gridSize;
  }

  this.planeXMin = floor(model.xAxisMinMax.min, this.xyGridSize);
  this.planeYMin = floor(model.yAxisMinMax.min, this.xyGridSize);
  this.zAxisMin = floor(model.valueMinMax.min, this.zGridSize);
  this.zAxisMax = ceil(model.valueMinMax.max, this.zGridSize);

  ThreeJSView.call(this, model, scene);
}

ZAxisView.prototype = Object.create(ThreeJSView.prototype);

ZAxisView.prototype.render = function() {

  var material = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 1,
  });

  // outline
  var outline = new THREE.Geometry();
  outline.vertices.push(this.scaleXYZ(
    this.planeXMin, this.planeYMin, this.zAxisMin));
  outline.vertices.push(this.scaleXYZ(
    this.planeXMin, this.planeYMin, this.zAxisMax));
  this.sceneObject.add(new THREE.Line(outline, material));

  // ticks
  var tick;
  var hersheyResult;
  for (var z = this.zAxisMin; z <= this.zAxisMax; z += this.zGridSize) {
    tick = new THREE.Geometry();
    tick.vertices.push(this.scaleXYZ(
      this.planeXMin, this.planeYMin, z));
    tick.vertices.push(this.scaleXYZ(
      this.planeXMin - this.xyGridSize/4, this.planeYMin, z));
    this.sceneObject.add(new THREE.Line(tick, material));

    hersheyResult = hershey.stringToLines(String(z.toFixed(1)));
    hersheyResult.lines.forEach(function(points) {

      var geom = new THREE.Geometry();
      geom.vertices = points.map(function(p) {
        return new THREE.Vector3(p[0]/400, 0, -p[1]/400);
      });

      var line = new THREE.Line(geom, material);

      var position = this.scaleXYZ(
        this.planeXMin - this.xyGridSize*3/8, 
        this.planeYMin,
        z);
      position.x -= hersheyResult.width/400;
      line.position.copy(position);

      this.sceneObject.add(line);
    }, this);
  }

  // center
  this.sceneObject.position.copy(this.scaleXYZ(
    -(this.model.xRange/2 - this.model.xAxisMinMax.min),  
    -(this.model.yRange/2 - this.model.yAxisMinMax.min), 
    this.model.valueMinMax.min));
  
};

module.exports = ZAxisView;