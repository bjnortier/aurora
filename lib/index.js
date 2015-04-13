module.exports.gradients = require('./gradients');
module.exports.MinMax = require('./MinMax');

module.exports.models = {
  HeightMapModel: require('./mvc/models/HeightMapModel'),
};

module.exports.views = {
  XYPlaneAxesView: require('./mvc/views/XYPlaneAxesView'),
  HeightMapView: require('./mvc/views/HeightMapView'),
};