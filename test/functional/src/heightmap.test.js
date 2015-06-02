var flow = require('flow');
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
var model = new HeightMapModel(data, {holeValue: -7});

var viewOptions = {
  scaleXYZ: model.scaleXYZ11,  
  unscaleXYZ: model.unscaleXYZ11,
  xyGridSize: 1.0,
  zGridSize: 200.0,
};

var heightMapView = new HeightMapView(model, scene, viewOptions);
new XYPlaneAxesView(model, scene, viewOptions);
new ZAxisView(model, scene, viewOptions);
var coordinateLabelView = new CoordinateLabelView(model, scene, viewOptions);
coordinateLabelView.hide();

new ViewPositionEventController(new EmptyModel(), heightMapView, coordinateLabelView);
