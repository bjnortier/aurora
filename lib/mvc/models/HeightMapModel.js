var Model = require('flow').Model;

var MinMax = require('../../').MinMax;

function HeightMapModel(data) {
  Model.call(this);

  this.data = data;

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

  this.xRange = (xAxisMinMax.max - xAxisMinMax.min);
  this.yRange = (yAxisMinMax.max - yAxisMinMax.min);
  this.vRange = (valueMinMax.max - valueMinMax.min);

  this.xAxisMinMax = xAxisMinMax;
  this.yAxisMinMax = yAxisMinMax;
  this.valueMinMax = valueMinMax;
}

Model.prototype = Object.create(Model.prototype);

module.exports = HeightMapModel;