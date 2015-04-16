var hershey = require('hershey');
var THREE = require('flow').THREE;
var ThreeJSView = require('flow').views.ThreeJSView;

function CoordinateLabelView(model, scene, options) {
  this.unscaleXYZ = options.unscaleXYZ;
  ThreeJSView.call(this, model, scene, options);
}

CoordinateLabelView.prototype = Object.create(ThreeJSView.prototype);

CoordinateLabelView.prototype.render = function() {
  var geom = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  var material = new THREE.MeshLambertMaterial({color: 0xff0000});
  var mesh = new THREE.Mesh(geom, material);
  this.sceneObject.add(mesh);
};

CoordinateLabelView.prototype.update = function(position) {
  ThreeJSView.prototype.update.call(this);
  ThreeJSView.prototype.clear.call(this);

  var unscaled = this.unscaleXYZ(position);

  var material = new THREE.LineBasicMaterial({
    color: 0x000000,
    linewidth: 1,
  });

  // outline
  var outline = new THREE.Geometry();
  var p1 = new THREE.Vector3(position.x, position.y, position.z);
  var p2 = p1.clone().setZ(position.z + 0.2);
  outline.vertices.push(p1);
  outline.vertices.push(p2);
  this.sceneObject.add(new THREE.Line(outline, material));

  // label
  var value = unscaled.z.toFixed(1);
  var hersheyResult = hershey.stringToLines(value);
  hersheyResult.lines.forEach(function(points) {

    var geom = new THREE.Geometry();
    geom.vertices = points.map(function(p) {
      return new THREE.Vector3(0, p[0]/400, -p[1]/400);
    });

    var line = new THREE.Line(geom, material);
    position.x -= hersheyResult.width/400;
    line.position.copy(position);
    line.position.copy(p2.clone().setZ(position.z + 0.3));
    this.sceneObject.add(line);
  }, this);

};

module.exports = CoordinateLabelView;