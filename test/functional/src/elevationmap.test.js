var flow = require('flow');
var THREE = flow.THREE;
var $ = flow.$;
var Scene = flow.scenes.ThreeJSScene;

var gradients = require('../../../').gradients;
var MinMax = require('../../../').MinMax;

var data = require('../data/elevationmapdata');

// Data consistency check
if (data.values.length !== data.yAxis.length) {
  throw new Error('inconsistent data - rows don\'t match');
}
if (data.values[0].length !== data.xAxis.length) {
  throw new Error('inconsistent data - columns don\'t match');
}

var xAxisMinMax = new MinMax().reduceArray(data.xAxis);
var yAxisMinMax = new MinMax().reduceArray(data.yAxis);
var valueMinMax = new MinMax();
for (var i = 0; i < data.values.length; ++i) {
  valueMinMax = valueMinMax.reduceArray(data.values[i]);
}

var xRange = (xAxisMinMax.max - xAxisMinMax.min);
var yRange = (yAxisMinMax.max - yAxisMinMax.min);
var vRange = (valueMinMax.max - valueMinMax.min);

var scene = new Scene($('#viewport'));

var xyScale = (xRange > yRange) ? 1/xRange : 1/yRange;
var hScale = 0.5/vRange;
console.log('xRange', xRange);
console.log('yRange', yRange);
console.log('scales', xyScale, hScale);

function scaleVector(x,y,z) {
  return new THREE.Vector3(
    (x - xAxisMinMax.min)*xyScale,
    (z - valueMinMax.min)*hScale,
    (y - yAxisMinMax.min)*xyScale);
}

var geom = new THREE.Geometry();

var xl = data.values[0].length;
var yl = data.values.length;

for (var iy = 0; iy < yl; ++iy) {
  for(var ix = 0; ix < xl; ++ix) {
    geom.vertices.push(
      scaleVector(data.xAxis[ix], data.yAxis[iy], data.values[iy][ix]));
  }
}

for (var iy = 0; iy < data.values.length - 1; ++iy) {
  for(var ix = 0; ix < data.values[iy].length - 1; ++ix) {
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
        var t = (v - valueMinMax.min)/vRange;
        var rgb = gradients.blackredyellow(t);
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


//     geom.vertices.push(
//       scaleVector(data.xAxis[ix + 1], data.yAxis[iy], data.values[iy][ix + 1]));
//     geom.vertices.push(
//       scaleVector(data.xAxis[ix + 1], data.yAxis[iy + 1], data.values[iy + 1][ix + 1]));
//     geom.vertices.push(
//       scaleVector(data.xAxis[ix], data.yAxis[iy + 1], data.values[iy + 1][ix]));

//     // // Mid point
//     // var avgValue = (data.values[iy][ix] + 
//     //   data.values[iy][ix + 1] + 
//     //   data.values[iy + 1][ix + 1] + 
//     //   data.values[iy + 1][ix])/4; 
//     // geom.vertices.push(
//     //   scaleVector(
//     //     (data.xAxis[ix] + data.xAxis[ix + 1])/2, 
//     //     (data.yAxis[iy] + data.yAxis[iy + 1])/2,
//     //     avgValue));

//     geom.faces.push(new THREE.Face3(0,1,4));
//     geom.faces.push(new THREE.Face3(1,2,4));
//     geom.faces.push(new THREE.Face3(2,3,4));
//     geom.faces.push(new THREE.Face3(3,0,4));

geom.computeFaceNormals();

//     var hue = 0.33 + (avgValue - valueMinMax.min)/vRange*0.67;
//     var color = new THREE.Color().setHSL(hue, 1.0, 0.5);
// var mat = new THREE.MeshLambertMaterial({color: 0xff0000});

var mat = new THREE.MeshLambertMaterial({
  color: 0xffffff, 
  shading: THREE.FlatShading,
  vertexColors: THREE.VertexColors
});

mat.side = THREE.DoubleSide;
var mesh = new THREE.Mesh(geom, mat);
//     var pos = scaleVector(
//       xAxisMinMax.min + (xAxisMinMax.max - xAxisMinMax.min)/2,
//       yAxisMinMax.min + (yAxisMinMax.max - yAxisMinMax.min)/2,
//       valueMinMax.min).negate();
//     mesh.position.copy(pos);

scene.threeScene.add(mesh);
//   }
// }

