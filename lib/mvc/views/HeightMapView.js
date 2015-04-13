var THREE = require('flow').THREE;
var ThreeJSView = require('flow').views.ThreeJSView;

var gradients = require('../../../').gradients;

function HeightMapView(model, scene) {
  var xRange = model.xRange;
  var yRange = model.yRange;
  var vRange = model.vRange;

  var xAxisMinMax = model.xAxisMinMax;
  var yAxisMinMax = model.yAxisMinMax;
  var valueMinMax = model.valueMinMax;

  var xyScale = (xRange > yRange) ? 1/xRange : 1/yRange;
  var hScale = 0.5/vRange;

  this.scaleVector = function (x,y,z) {
    return new THREE.Vector3(
      (x - xAxisMinMax.min)*xyScale,
      (y - yAxisMinMax.min)*xyScale,
      (z - valueMinMax.min)*hScale);
  };

  ThreeJSView.call(this, model, scene);
}

HeightMapView.prototype = Object.create(ThreeJSView.prototype);

HeightMapView.prototype.render = function() {
  var geom = new THREE.Geometry();

  var model = this.model;
  var data = model.data;

  var xl = data.values[0].length;
  var yl = data.values.length;

  var ix;
  var iy;
  for (iy = 0; iy < yl; ++iy) {
    for(ix = 0; ix < xl; ++ix) {
      geom.vertices.push(
        this.scaleVector(data.xAxis[ix], data.yAxis[iy], data.values[iy][ix]));
    }
  }

  for (iy = 0; iy < data.values.length - 1; ++iy) {
    for(ix = 0; ix < data.values[iy].length - 1; ++ix) {
      if (ix % xl !== 0) {
        var f1 = new THREE.Face3(
          ix + iy*xl,
          ix + 1 + iy*xl,
          ix + 1 + (iy + 1)*xl);
        var f2 = new THREE.Face3(
          ix + iy*xl,
          ix + 1 + (iy + 1)*xl,
          ix + (iy + 1)*xl);

        var values = [
          data.values[iy][ix],
          data.values[iy][ix + 1],
          data.values[iy + 1][ix + 1],
          data.values[iy + 1][ix],
        ];
        var colors = values.map(function(v) {
          var t = (v - model.valueMinMax.min)/model.vRange;
          var rgb = gradients.bluecyangreenyellowred(t);
          return new THREE.Color().setRGB(rgb[0], rgb[1], rgb[2]);
        });


        f1.vertexColors[0] = colors[0];
        f1.vertexColors[1] = colors[1];
        f1.vertexColors[2] = colors[2];
        
        f2.vertexColors[0] = colors[0];
        f2.vertexColors[1] = colors[2];
        f2.vertexColors[2] = colors[3];

        geom.faces.push(f1);
        geom.faces.push(f2);
      }
    }
  }

  geom.computeFaceNormals();

  var mat = new THREE.MeshLambertMaterial({
    color: 0xffffff, 
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors
  });

  mat.side = THREE.DoubleSide;
  var mesh = new THREE.Mesh(geom, mat);

  this.sceneObject.add(mesh);

};

module.exports = HeightMapView;