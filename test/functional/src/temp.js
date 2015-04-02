var $ = require('./vendor').$;
var THREE = require('./vendor').three;
var conrec = require('conrec');
console.log(conrec);

var Scene = require('./Scene');
var data = require('./heatmapdata');
var MinMax = require('../../../lib/MinMax');

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

console.log('x', xAxisMinMax.toString());
console.log('y', yAxisMinMax.toString());
console.log('v', valueMinMax.toString());

var c = new conrec.Conrec();
var numLevels = 100;
var levels = [];
var valueRangePerLevel = vRange/(numLevels+1);
for (var i = 1; i <= numLevels; ++i) {
  levels.push(i*valueRangePerLevel);
}
console.log(levels);
c.contour(
  data.values, 
  0, data.values[0].length - 1, 
  0, data.values.length - 1,
  data.xAxis, data.yAxis, 
  numLevels, 
  levels);

var colors = [];
for (var i = 0; i < numLevels+1; ++i) {
  colors.push(new THREE.Color().setHSL(i/(numLevels+1), 1.0, 0.5));
}

var contourList = c.contourList();
console.log(contourList);

var SVG = require('svg.js');
var draw = SVG('drawing');

draw.rect(500, 500).fill('white');

for (var k in c.contours) {
  if (k > 3) {
    continue;
  }
  var contour = c.contours[k];
// contourList.forEach(function(contour, i) {
  var points = [];

  console.log(contour.count, contour.s.closed);

  var iterator = contour.s.head;
  while (iterator !== contour.s.tail) {
    points.push([
      (iterator.p.x - xAxisMinMax.min)/xRange*500,
      (iterator.p.y - yAxisMinMax.min)/yRange*500]);
    iterator = iterator.next;
  }
  // if (contour.length > 2) {
  //   var points = contour.map(function(coord) {
  //     return [
  //       (coord.x - xAxisMinMax.min)/xRange*500,
  //       (coord.y - yAxisMinMax.min)/yRange*500,
  //     ];
  //   });
  //   points.push(points[0]);
  //   var rgbString = 
  //     'red';
  //     // 'rgb(' + 
  //     //   Math.round(colors[i + 1].r*255) + ',' +
  //     //   Math.round(colors[i + 1].g*255) + ',' +
  //     //   Math.round(colors[i + 1].b*255) + ')';
  
  var polyline = draw.polyline(points);
  polyline.stroke({ color: 'red', width: 1 });
  if (contour.s.closed) {
    polyline.fill('yellow');
  } else {
    polyline.fill('none');
  }
      
  //     // .fill(rgbString)
  // }
}

var scene = new Scene($('#viewport'));

var dataURL = "data:image/svg+xml;base64," + btoa($('#drawing').html());
var img = new Image();
img.src = dataURL;
// http://stackoverflow.com/questions/21049179/
// drawing-an-svg-containing-html-in-a-canvas-with-safari
img.onload = function() {
  var texture = new THREE.Texture(img);
  texture.needsUpdate = true;
  var material = 
  new THREE.MeshBasicMaterial({
    map : texture,
  });
  scene.threeScene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    material));
};
img.onerror = function(e) {
  console.error(e);
};

//   var xyScale = (xRange > yRange) ? 1/xRange : 1/yRange;
//   var hScale = 0.5/vRange;
//   console.log('xRange', xRange);
//   console.log('yRange', yRange);
//   console.log('scales', xyScale, hScale);

//   function scaleVector(x,y,z) {
//     return new THREE.Vector3(
//       (x - xAxisMinMax.min)*xyScale,
//       (z - valueMinMax.min)*hScale,
//       (y - yAxisMinMax.min)*xyScale);
//   }

//   for (var iy = 0; iy < data.values.length - 1; ++iy) {
//     for(var ix = 0; ix < data.values[iy].length - 1; ++ix) {

//       var geom = new THREE.Geometry();
      
//       geom.vertices.push(
//         scaleVector(data.xAxis[ix], data.yAxis[iy], data.values[iy][ix]));
//       geom.vertices.push(
//         scaleVector(data.xAxis[ix + 1], data.yAxis[iy], data.values[iy][ix + 1]));
//       geom.vertices.push(
//         scaleVector(data.xAxis[ix + 1], data.yAxis[iy + 1], data.values[iy + 1][ix + 1]));
//       geom.vertices.push(
//         scaleVector(data.xAxis[ix], data.yAxis[iy + 1], data.values[iy + 1][ix]));

//       // Mid point
//       var avgValue = (data.values[iy][ix] + 
//         data.values[iy][ix + 1] + 
//         data.values[iy + 1][ix + 1] + 
//         data.values[iy + 1][ix])/4; 
//       geom.vertices.push(
//         scaleVector(
//           (data.xAxis[ix] + data.xAxis[ix + 1])/2, 
//           (data.yAxis[iy] + data.yAxis[iy + 1])/2,
//           avgValue));

//       geom.faces.push(new THREE.Face3(0,1,4));
//       geom.faces.push(new THREE.Face3(1,2,4));
//       geom.faces.push(new THREE.Face3(2,3,4));
//       geom.faces.push(new THREE.Face3(3,0,4));

//       geom.computeFaceNormals();

//       var hue = 0.33 + (avgValue - valueMinMax.min)/vRange*0.67;
//       var color = new THREE.Color().setHSL(hue, 1.0, 0.5);
//       var mat = new THREE.MeshLambertMaterial({color: color});
//       mat.side = THREE.DoubleSide;
//       var mesh = new THREE.Mesh(geom,   mat);
//       var pos = scaleVector(
//         xAxisMinMax.min + (xAxisMinMax.max - xAxisMinMax.min)/2,
//         yAxisMinMax.min + (yAxisMinMax.max - yAxisMinMax.min)/2,
//         valueMinMax.min).negate();
//       mesh.position.copy(pos);

//       scene.threeScene.add(mesh);
//     }
//   }

// }

// new TestCase();
