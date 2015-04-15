var flow = require('flow');
var THREE = flow.THREE;
var $ = flow.$;
var EmptyModel = flow.Model;
var Scene = flow.scenes.ThreeJSScene;
var AxesView = flow.views.AxesView;

var lib = require('../../../');

var HeightMapModel = lib.models.HeightMapModel;

var HeightMapView = lib.views.HeightMapView;
var XYPlaneAxesView = lib.views.XYPlaneAxesView;
var ZAxisView = lib.views.ZAxisView;
var CoordinateLabelView = lib.views.CoordinateLabelView;

var ViewPositionEventController = lib.controllers.ViewPositionEventController;

var scene = new Scene($('#viewport'), {cameraPosition: {x: 0.2, y: -2, z: 1.5}});
new AxesView(new EmptyModel(), scene);

var data = require('../data/heightmapdata');
var model = new HeightMapModel(data);

var xyScale;
var xOffset;
var yOffset;
if (model.xRange > model.yRange) {
  xyScale = 1/model.xRange;
  xOffset = 0;
  yOffset = model.yRange/2/xyScale;
} else {
  xyScale = 1/model.yRange;
  xOffset = model.yRagne/2/xyScale;
  yOffset = 0;
}
var hScale = 0.5/model.vRange;

function scaleXYZ(x, y, z) {
  return new THREE.Vector3(
    (x - model.xAxisMinMax.min)*xyScale,
    (y - model.yAxisMinMax.min)*xyScale,
    (z - model.valueMinMax.min)*hScale);
}

function unscaleXYZ(vector) {
  return {
    x: vector.x/xyScale + model.xAxisMinMax.min,
    y: vector.y/xyScale + model.yAxisMinMax.min,
    z: vector.z/hScale + model.valueMinMax.min,
  };
}

var viewOptions = {
  scaleXYZ: scaleXYZ,  
  unscaleXYZ: unscaleXYZ,
};

var heightMapView = new HeightMapView(model, scene, viewOptions);
new XYPlaneAxesView(model, scene, viewOptions);
new ZAxisView(model, scene, viewOptions);
var coordinateLabelView = new CoordinateLabelView(model, scene, viewOptions);
coordinateLabelView.hide();

new ViewPositionEventController(new EmptyModel(), heightMapView, coordinateLabelView);
