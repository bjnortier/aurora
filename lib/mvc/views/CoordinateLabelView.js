var hershey = require('hershey');
var THREE = require('flow').THREE;
var ThreeJSView = require('flow').views.ThreeJSView;

class CoordinateLabelView extends ThreeJSView {

  constructor(model, scene, options) {
    super(model, scene, options);
    this.unscaleXYZ = options.unscaleXYZ;
  }


  render() {
    ThreeJSView.prototype.render.call(this);
  }

  update(position) {
    ThreeJSView.prototype.update.call(this);
    this.clear();

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
        return new THREE.Vector3(p[0]/400, 0, -p[1]/400);
      });

      var line = new THREE.Line(geom, material);
      position.x -= hersheyResult.width/400;
      line.position.copy(position);
      line.position.copy(p2.clone().setZ(position.z + 0.3));
      this.sceneObject.add(line);
    }, this);

  }

}

module.exports = CoordinateLabelView;