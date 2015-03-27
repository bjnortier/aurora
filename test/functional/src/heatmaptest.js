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
  var dx = (xAxisMinMax.max - xAxisMinMax.min)/(data.xAxis.length - 1);
  var dy = (yAxisMinMax.max - yAxisMinMax.min)/(data.yAxis.length - 1);
  var dv = (valueMinMax.max - valueMinMax.min);

  var xyScale = (dx > dy) ? 1/dx : 1/dy;
  var hScale = 0.5/dv;
  console.log('dx', dx);
  console.log('dy', dy);
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

      geom.faces.push(new THREE.Face3(0,1,2));
      geom.faces.push(new THREE.Face3(0,2,3));

      geom.computeFaceNormals();

      var mesh = new THREE.Mesh(
        geom, 
        new THREE.MeshLambertMaterial({color: 0x0000ff}));

      scene.threeScene.add(mesh);
    }
  }

}

new TestCase();
