var THREE = require('flow').THREE;
var ThreeJSView = require('flow').views.ThreeJSView;

var gradients = require('../../../').gradients;

class HeightMapView extends ThreeJSView {

  constructor(model, scene, options) {
    super(model, scene, options);
    this.scaleXYZ = options.scaleXYZ;
    this.dataModelField = options.dataModelField;
  }

  render() {
    ThreeJSView.prototype.render.call(this);
    
    var geom = new THREE.Geometry();

    var model;
    if (this.dataModelField) {
      var fields = this.dataModelField.split('.');
      model = fields.reduce(function(acc, field) {
        return acc[field];
      }, this.model);
    } else {
      model = this.model;
    }
    var data = model.data;

    var xl = data.values[0].length;
    var yl = data.values.length;

    var ix;
    var iy;
    for (iy = 0; iy < yl; ++iy) {
      for(ix = 0; ix < xl; ++ix) {
        geom.vertices.push(
          this.scaleXYZ(data.xAxis[ix], data.yAxis[iy], data.values[iy][ix]));
      }
    }

    for (iy = 0; iy < yl - 1; ++iy) {
      for(ix = 0; ix < xl - 1; ++ix) {
        var f1 = new THREE.Face3(
          ix + iy*xl,
          ix + 1 + iy*xl,
          ix + 1 + (iy + 1)*xl);
        var f2 = new THREE.Face3(
          ix + iy*xl,
          ix + 1 + (iy + 1)*xl,
          ix + (iy + 1)*xl);

        var quad = [
          data.values[iy][ix],
          data.values[iy][ix + 1],
          data.values[iy + 1][ix + 1],
          data.values[iy + 1][ix],
        ];

        if (model.holeValue !== undefined) {
          var holeValue = model.holeValue;
          if ((quad[0] === holeValue) ||
              (quad[1] === holeValue) ||
              (quad[2] === holeValue) ||
              (quad[3] === holeValue)) {
            continue;
          }
        }

        var colors = quad.map(function(v) {
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

    geom.computeFaceNormals();

    var mat = new THREE.MeshLambertMaterial({
      color: 0xffffff, 
      shading: THREE.FlatShading,
      vertexColors: THREE.VertexColors
    });

    mat.side = THREE.DoubleSide;
    var mesh = new THREE.Mesh(geom, mat);

    this.sceneObject.add(mesh);

  }

  update() {
    super.render();
  }

}

module.exports = HeightMapView;