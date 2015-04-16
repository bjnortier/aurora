module.exports.gradients = require('./gradients');
module.exports.MinMax = require('./MinMax');

module.exports.models = {
  HeightMapModel: require('./mvc/models/HeightMapModel'),
};

module.exports.views = {
  XYPlaneAxesView: require('./mvc/views/XYPlaneAxesView'),
  ZAxisView: require('./mvc/views/ZAxisView'),
  HeightMapView: require('./mvc/views/HeightMapView'),
  CoordinateLabelView: require('./mvc/views/CoordinateLabelView'),
};

module.exports.controllers = {
  ViewPositionEventController: require('./mvc/controllers/ViewPositionEventController'),
};