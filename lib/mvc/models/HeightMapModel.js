var Model = require('flow').Model;

var MinMax = require('../../').MinMax;

function HeightMapModel(data, options) {
  Model.call(this);

  options = options || {};
  this.data = data;
  this.holeValue = options.holeValue;

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

  var holeValue = this.holeValue;
  var holeFilter = function(x) {
    if (holeValue !== undefined) {
      return x !== holeValue;
    } else {
      return true;
    }
  };
  for (var i = 0; i < data.values.length; ++i) {
    valueMinMax = valueMinMax.reduceArray(data.values[i], holeFilter);
  }

  var xRange = (xAxisMinMax.max - xAxisMinMax.min);
  var yRange = (yAxisMinMax.max - yAxisMinMax.min);
  var vRange = (valueMinMax.max - valueMinMax.min);

  // Scale the largest of X and Y to 0-1, and H to 0.5
  var xyScale;
  var xOffset;
  var yOffset;
  if (xRange > yRange) {
    xyScale = 1/xRange;
    xOffset = 0;
    yOffset = yRange/2/xyScale;
  } else {
    xyScale = 1/yRange;
    xOffset = yRange/2/xyScale;
    yOffset = 0;
  }
  var hScale = 0.5/vRange;

  function scaleXYZ(x, y, z) {
    return {
      x: (x - xAxisMinMax.min)*xyScale,
      y: (y - yAxisMinMax.min)*xyScale,
      z: (z - valueMinMax.min)*hScale,
    };
  }

  function unscaleXYZ(vector) {
    return {
      x: vector.x/xyScale + xAxisMinMax.min,
      y: vector.y/xyScale + yAxisMinMax.min,
      z: vector.z/hScale + valueMinMax.min,
    };
  }

  this.xRange = xRange;
  this.yRange = yRange;
  this.vRange = vRange;

  this.xAxisMinMax = xAxisMinMax;
  this.yAxisMinMax = yAxisMinMax;
  this.valueMinMax = valueMinMax;

  this.scaleXYZ = scaleXYZ;
  this.unscaleXYZ = unscaleXYZ;
}

HeightMapModel.prototype = Object.create(Model.prototype);

module.exports = HeightMapModel;