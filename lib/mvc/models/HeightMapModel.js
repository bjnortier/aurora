var Model = require('flow').Model;

var MinMax = require('../../').MinMax;

class HeightMapModel extends Model {

  constructor(data, options) {
    super();

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

    // For the 1x1x1 box scaling, scale the largest of X and Y to 0-1, and H to 1
    var xyScale;
    if (xRange > yRange) {
      xyScale = 1/xRange;
    } else {
      xyScale = 1/yRange;
    }
    var hScale = 1/vRange;

    function scaleXYZ11(x, y, z) {
      return {
        x: (x - xAxisMinMax.min)*xyScale,
        y: (y - yAxisMinMax.min)*xyScale,
        z: (z - valueMinMax.min)*hScale,
      };
    }

    function unscaleXYZ11(vector) {
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

    this.scaleXYZ11 = scaleXYZ11;
    this.unscaleXYZ11 = unscaleXYZ11;
  }

}

module.exports = HeightMapModel;