var flow = require('flow');
var $ = flow.$;
var EmptyModel = flow.Model;
var Scene = flow.scenes.ThreeJSScene;
var AxesView = flow.views.AxesView;

var lib = require('../../../');

// var XYGridAxesView = lib.XYGridAxesView;
var HeightMapModel = lib.models.HeightMapModel;
var HeightMapView = lib.views.HeightMapView;



var scene = new Scene($('#viewport'));
new AxesView(new EmptyModel(), scene);

// new XYGridAxesView(heightMapModel, scene);

var data = require('../data/heightmapdata');
var heightMapModel = new HeightMapModel(data);
new HeightMapView(heightMapModel, scene);

