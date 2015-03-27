var $ = require('./vendor').$;
var THREE = require('./vendor').three;

var Scene = require('./Scene');
var data = require('./heatmapdata');
var MinMax = require('../../../lib/MinMax');

function TestCase() {

  var $testcaseContainer = $(
    '<div class="testcase">' + 
      '<div class="viewport"></div>' +
    '</div>');
  $('body').append($testcaseContainer);

  var scene = new Scene($testcaseContainer.find('.viewport'));

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

  console.log('x', xAxisMinMax.toString());
  console.log('y', yAxisMinMax.toString());
  console.log('v', valueMinMax.toString());

  // Normalize to a box with max width or depth = 1
  // and a height = 0.5
  var xRange = (xAxisMinMax.max - xAxisMinMax.min);
  var yRange = (yAxisMinMax.max - yAxisMinMax.min);
  var vRange = (valueMinMax.max - valueMinMax.min);

  var xyScale = (xRange > yRange) ? 1/xRange : 1/yRange;
  var hScale = 0.5/vRange;
  console.log('xRange', xRange);
  console.log('yRange', yRange);
  console.log('scales', xyScale, hScale);

  function scaleVector(x,y,z) {
    return new THREE.Vector3(
      (x - xAxisMinMax.min)*xyScale,
      (y - yAxisMinMax.min)*xyScale,
      (z - valueMinMax.min)*hScale);
  }

  for (var iy = 0; iy < data.values.length - 1; ++iy) {
    for(var ix = 0; ix < data.values[iy].length - 1; ++ix) {

      var geom = new THREE.Geometry();
      
      geom.vertices.push(
        scaleVector(data.xAxis[ix], data.yAxis[iy], data.values[iy][ix]));
      geom.vertices.push(
        scaleVector(data.xAxis[ix + 1], data.yAxis[iy], data.values[iy][ix + 1]));
      geom.vertices.push(
        scaleVector(data.xAxis[ix + 1], data.yAxis[iy + 1], data.values[iy + 1][ix + 1]));
      geom.vertices.push(
        scaleVector(data.xAxis[ix], data.yAxis[iy + 1], data.values[iy + 1][ix]));

      // Mid point
      var avgValue = (data.values[iy][ix] + 
        data.values[iy][ix + 1] + 
        data.values[iy + 1][ix + 1] + 
        data.values[iy + 1][ix])/4; 
      geom.vertices.push(
        scaleVector(
          (data.xAxis[ix] + data.xAxis[ix + 1])/2, 
          (data.yAxis[iy] + data.yAxis[iy + 1])/2,
          avgValue));

      geom.faces.push(new THREE.Face3(0,1,4));
      geom.faces.push(new THREE.Face3(1,2,4));
      geom.faces.push(new THREE.Face3(2,3,4));
      geom.faces.push(new THREE.Face3(3,0,4));

      geom.computeFaceNormals();

      var hue = (avgValue - valueMinMax.min)/vRange;
      var color = new THREE.Color().setHSL(hue, 1.0, 0.5);
      var mesh = new THREE.Mesh(
        geom, 
        new THREE.MeshLambertMaterial({color: color}));
      var pos = scaleVector(
        xAxisMinMax.min + (xAxisMinMax.max - xAxisMinMax.min)/2,
        yAxisMinMax.min + (yAxisMinMax.max - yAxisMinMax.min)/2,
        valueMinMax.min).negate();
      mesh.position.copy(pos);

      scene.threeScene.add(mesh);
    }
  }

}

new TestCase();
